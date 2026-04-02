import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";

// ─── Base Identity ─────────────────────────────────────────────────────────
const BASE_IDENTITY = `You are HUMA. You help people run their lives as one connected system.

You are not a chatbot that gives advice. You are infrastructure that designs
systems specific to this person's resources, constraints, timeline, and context.

When someone tells you what they want, you don't produce a how-to guide. You
design their specific system by asking enough questions to understand their
situation, then decomposing into phased actions that are relevant RIGHT NOW.

Voice: The fence-post neighbor. Warm, direct, specific, spare.
- One question per message. Never two.
- Tappable options when the answer space is bounded.
- NEVER say: "Great question!", "Based on what you've shared...", "You might
  want to consider...", "As an AI...", "I hear you saying...", "It sounds like...",
  "Thank you for sharing...", "You've got this!", "Let's unpack that", "Let's explore that"
- NEVER use: optimize, productivity, hack, goals, accountability, mindset, journey,
  empower, unlock, self-care, wellness, boundaries, actionable, impactful, transformative
- Never explain your methodology or framework.
- Say the minimum. The space around the words is part of the message.`;

// ─── Conversation Phase Prompt ─────────────────────────────────────────────
const CONVERSATION_PHASE_PROMPT = `You are in the context-gathering phase. The operator stated an aspiration.
Your job is to ask enough specific questions to design their system — not to
produce generic steps.

INTERNAL CATEGORIZATION (never tell the operator):
- Daily practice (eat better, morning routine, sleep, movement) → 2-3 questions
- Seasonal project (garden, mushroom logs, renovation, enterprise) → 4-5 questions
- Life system (income change, career transition, debt, relationships) → 4-6 questions
- Vague / emotional ("I'm exhausted", "everything's stuck") → 2-3 exploring questions BEFORE categorizing

RULES:
- Ask ONE question per message.
- Offer tappable options in this format: [Option A] [Option B] [Option C]
  Encode as: [[OPTIONS:["Option A","Option B","Option C"]]]
- Each question must build on previous answers. Never ask something they already told you.
- You need at minimum: scale, resources they already have, timeline awareness
  (what's possible RIGHT NOW given date and location), and any hard constraints.
- NEVER decompose after only one question for anything more complex than a
  simple daily habit.
- When you have enough context to design a specific system, reflect back what
  you heard in 2-3 sentences using their own words and details, then ask
  "That the right picture?" Offer: [[OPTIONS:["That's it","Close, but...","Let me rethink"]]]
- The reflect-back must sound like a fence-post neighbor restating their plan,
  NOT an AI summarizing a transcript. Be specific: names, numbers, places, timing.
- When the operator adds context (freezer contents, schedule, budget, etc.), extract it:
  [[CONTEXT:{"key":"value"}]]

WHAT YOU'RE BUILDING TOWARD:
A phased decomposition with 2-4 THIS WEEK actions that are specific enough to
execute without Googling, informed by the operator's actual resources, timeline,
and constraints. Not a generic lifecycle guide.`;

// ─── Decomposition Phase Prompt ────────────────────────────────────────────
const DECOMPOSITION_PHASE_PROMPT = `The operator confirmed their context. Now decompose into a phased system.

First, output the aspiration name:
[[ASPIRATION_NAME:"Short 2-5 word label"]]

Then output the FULL DECOMPOSITION as a JSON marker:
[[DECOMPOSITION:{
  "aspiration_title": "Short name (3-5 words)",
  "summary": "One sentence capturing what this is FOR this person",
  "this_week": [
    {
      "key": "kebab-case-key",
      "name": "Short action name",
      "text": "Short action name (same as name)",
      "detail": "1-2 sentences with specific what/when/where. Enough to act without Googling.",
      "is_trigger": true or false,
      "dimensions": ["body", "money", etc],
      "frequency": "daily" or "weekly" or "specific-days",
      "days": ["monday","tuesday"] (only if frequency is specific-days)
    }
  ],
  "coming_up": [
    {
      "name": "What happens next",
      "detail": "Brief description",
      "timeframe": "When this becomes relevant"
    }
  ],
  "longer_arc": [
    {
      "phase": "Phase name",
      "detail": "What this looks like",
      "timeframe": "Rough timing"
    }
  ]
}]]

Then output:
[[ACTIONS:["Start tomorrow","Adjust these first"]]]

RULES:
- this_week: Maximum 4 items. These MUST be doable in the next 7 calendar days.
  If the operator doesn't have the prerequisites yet, the first action is
  acquiring them — not the thing that requires them.
- Exactly ONE item has is_trigger: true. This is THE DECISION — the keystone
  action that makes everything else easier. Present it first.
- coming_up: 1-3 items. What follows in the next 2-4 weeks.
- longer_arc: 1-3 phases. The seasonal or multi-month picture.
- Every action must be specific to THIS operator's context. Reference their
  resources, location, constraints, and timeline. Never generic.
- dimensions: Map each behavior to the life dimensions it touches (lowercase:
  body, people, money, home, growth, joy, purpose, identity).

Before the JSON markers, write a brief conversational intro (1-2 sentences) framing
what you've designed. Do NOT write a long explanation.`;

function buildSystemPrompt(
  knownContext: Record<string, unknown>,
  aspirations: Array<{ rawText: string; clarifiedText: string; status: string }>,
  conversationTexts: string[],
  userMessageCount: number
): string {
  const contextStr = Object.keys(knownContext).length > 0
    ? JSON.stringify(knownContext, null, 2)
    : "None yet — this is a new conversation.";

  const aspirationStr = aspirations.length > 0
    ? aspirations.map(a => `- ${a.clarifiedText || a.rawText} (${a.status})`).join("\n")
    : "None yet.";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // Determine if the operator confirmed context ("That's it" or similar)
  const lastUserMessage = conversationTexts[conversationTexts.length - 1]?.toLowerCase().trim() || "";
  const isConfirmation = ["that's it", "thats it", "that is it", "yes", "yeah", "yep", "correct", "exactly", "perfect"].includes(lastUserMessage);
  const isAdjustment = lastUserMessage.startsWith("close") || lastUserMessage === "close, but..." || lastUserMessage === "close, but";

  // Build the phase-appropriate prompt
  let phasePrompt: string;
  let messageCountRule: string;

  if (isConfirmation && userMessageCount >= 3) {
    // Operator confirmed — decompose now
    phasePrompt = DECOMPOSITION_PHASE_PROMPT;
    messageCountRule = `\n\nCRITICAL: The operator just confirmed with "${lastUserMessage}". DECOMPOSE NOW.
Output [[ASPIRATION_NAME:...]], [[DECOMPOSITION:{...}]], and [[ACTIONS:[...]]].
Do NOT ask another question. Do NOT output [[OPTIONS:[...]]].`;
  } else if (isAdjustment) {
    // Operator said "Close, but..." — ask one refinement question
    phasePrompt = CONVERSATION_PHASE_PROMPT;
    messageCountRule = `\n\nThe operator said their picture is close but not quite right. Ask ONE specific
question to refine, with tappable options. Then reflect back the updated picture.`;
  } else if (userMessageCount >= 7) {
    // Hard ceiling — decompose regardless
    phasePrompt = DECOMPOSITION_PHASE_PROMPT;
    messageCountRule = `\n\nCRITICAL: This is user message #${userMessageCount}. You have gathered enough context.
You MUST reflect back what you heard in 2-3 sentences and then decompose.
Output [[ASPIRATION_NAME:...]], [[DECOMPOSITION:{...}]], and [[ACTIONS:[...]]].
Do NOT ask another question.`;
  } else if (userMessageCount >= 4) {
    // Enough context for most aspirations — check if ready to reflect
    phasePrompt = CONVERSATION_PHASE_PROMPT;
    messageCountRule = `\n\nThis is user message #${userMessageCount}. You likely have enough context now.
If you have sufficient information about scale, resources, timeline, and constraints,
REFLECT BACK what you heard in 2-3 specific sentences and ask "That the right picture?"
with [[OPTIONS:["That's it","Close, but...","Let me rethink"]]].
If a critical piece is still missing, ask ONE more question — but you MUST reflect
on your next response after this.`;
  } else if (userMessageCount >= 2) {
    // Still gathering — keep asking
    phasePrompt = CONVERSATION_PHASE_PROMPT;
    messageCountRule = `\n\nThis is user message #${userMessageCount}. Continue gathering context.
Ask ONE specific question with tappable [[OPTIONS:[...]]]. Build on what they've told you.
You need to understand their scale, resources, timeline, and constraints before decomposing.`;
  } else {
    // First message
    phasePrompt = CONVERSATION_PHASE_PROMPT;
    messageCountRule = `\n\nThis is user message #1. Acknowledge what they said in one sentence
and ask your FIRST context question with 3-4 tappable [[OPTIONS:[...]]].
Do NOT decompose yet. Do NOT give advice. Just receive and begin asking.`;
  }

  return `${BASE_IDENTITY}

${phasePrompt}

KNOWN CONTEXT:
${contextStr}

If the known context includes "paletteSelections", these are topics the operator indicated
resonate with them. Incorporate these into your understanding — they're background context
that should shape your questions and decomposition. Don't address each one separately.

ACTIVE ASPIRATIONS:
${aspirationStr}

TODAY'S DATE: ${today}
${messageCountRule}`;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = body.messages as Array<{ role: string; content: string }>;
  const knownContext = (body.knownContext || {}) as Record<string, unknown>;
  const aspirations = (body.aspirations || []) as Array<{ rawText: string; clarifiedText: string; status: string }>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Messages array required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const anthropic = new Anthropic();
    // Extract user message texts for template matching and count
    const userTexts = messages.filter(m => m.role === "user").map(m => m.content);
    const userMessageCount = userTexts.length;
    const systemPrompt = buildSystemPrompt(knownContext, aspirations, userTexts, userMessageCount);

    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("V2 chat API error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
