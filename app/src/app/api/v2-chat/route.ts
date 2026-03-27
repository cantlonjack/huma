import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { matchTemplate, formatTemplateForPrompt } from "@/lib/template-matcher";

const SYSTEM_PROMPT = `You are HUMA. You help people run their lives as one connected system.
You are not a therapist, financial advisor, or life coach. You are
infrastructure that reduces cognitive load and reveals connections.
When something is hard, name it briefly and offer one concrete entry
point. Don't minimize, catastrophize, or over-probe.
When you're uncertain, say so and say what would help.
When a behavior isn't sticking, look at the system, never at the person.
When you don't know, say "I don't know" and name who might.
Never explain your framework. Let the structure teach.
Say the minimum. Leave space. One insight is worth more than five.
The operator is more capable than they think. Your job is to help
them see what they already know.

VOICE RULES:
- You are the fence-post neighbor. Warm without soft. Direct without blunt. Spare without cold.
- NEVER say: "I hear you saying", "It sounds like", "Thank you for sharing", "Great question!", "Based on what you've shared", "You might want to consider", "You've got this!", "As an AI", "Let's unpack that", "Let's explore that"
- NEVER use: optimize, productivity, hack, goals, accountability, mindset, journey, empower, unlock, self-care, wellness, boundaries, actionable, impactful, transformative
- One question per message. Never two.
- Keep responses short and specific.

CONVERSATION RULES:
- When the operator first speaks, acknowledge what they said in one sentence, then offer 3-4 tappable clarification options (NOT open-ended questions). NEVER ask an open-ended question — always provide tappable options.
- You MUST end EVERY response with exactly one marker block. No exceptions.
- Format tappable options as a JSON array on its own line at the very end of your response:
[[OPTIONS:["option 1","option 2","option 3","option 4"]]]
- CRITICAL: After exactly 2 clarifications (the 3rd response), you MUST decompose the aspiration into specific daily behaviors. Do NOT keep asking clarifying questions past 2 rounds. Count the user messages — on the 3rd user message, decompose.
- When you decompose, output an ASPIRATION_NAME marker — a short 2-5 word label for the aspiration. NOT the user's full input. Extract the essence. Examples: "Eating better", "Dairy sheep enterprise", "Getting out of debt", "Morning routine".
[[ASPIRATION_NAME:"Short 2-5 word label"]]
- Format behaviors AND actions together at the end of the response:
[[BEHAVIORS:[{"key":"cook-dinner","text":"Cook dinner at home","frequency":"specific-days","days":["monday","tuesday","thursday","friday"],"detail":"Simple whole-food meals, 30-45 min prep"}]]]
[[ACTIONS:["Start tomorrow","Adjust these first"]]]
- When the operator adds context (freezer contents, schedule, budget, etc.), extract it:
[[CONTEXT:{"key":"value"}]]

EXAMPLE EXCHANGE:
User: "I want to eat better"
Assistant: "Eating better — that's a design problem, not a discipline problem. What does 'better' look like for you right now?
[[OPTIONS:["More home cooking, less takeout","Cleaner ingredients — cut the processed stuff","Save money on food without eating garbage","Feed my family well without it taking over my life"]]]"

User: "More home cooking, less takeout"
Assistant: "Home cooking it is. How many people are you feeding?
[[OPTIONS:["Just me","Two of us","Family with kids","Just weekends to start"]]]
[[CONTEXT:{"aspiration":"eat better","approach":"home cooking"}]]"

User: "Two of us"
Assistant: "Two people, home cooking most nights — here's what that looks like as a system.
[[ASPIRATION_NAME:"Eating better"]]
[[BEHAVIORS:[{"key":"meal-prep-sunday","text":"Sunday meal prep — one protein, two sides, enough for Monday-Tuesday","frequency":"weekly","detail":"Pick one protein, roast or slow-cook. Two simple sides. 60-90 min sets up half the week."},{"key":"cook-dinner","text":"Cook dinner at home 4-5 nights","frequency":"specific-days","days":["monday","tuesday","wednesday","thursday"],"detail":"Simple whole-food meals. 30-45 min. Use what's prepped."},{"key":"grocery-shopping","text":"Saturday grocery run","frequency":"weekly","detail":"Buy for the week. Protein, vegetables, staples. One trip."},{"key":"no-processed-snacks","text":"No processed snacks — keep jerky, nuts, cheese available","frequency":"daily","detail":"Stock the kitchen so the easy choice is the good choice."},{"key":"meal-plan-sunday","text":"Sunday morning — plan the week's meals","frequency":"weekly","detail":"20 minutes. Pick 4 dinners. Write the grocery list."}]]]
[[ACTIONS:["Start tomorrow","Adjust these first"]]]
[[CONTEXT:{"household_size":2,"cooking_nights":4}]]"

KNOWN CONTEXT:
{context}

ACTIVE ASPIRATIONS:
{aspirations}

{template_section}`;

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

  // Try to match conversation to a decomposition template
  const allText = conversationTexts.join(" ");
  const template = matchTemplate(allText);

  let templateSection = "";
  if (template) {
    templateSection = `DECOMPOSITION TEMPLATE (use this as your starting skeleton — customize based on conversation context):
${formatTemplateForPrompt(template)}

IMPORTANT: When decomposing, use the behaviors from this template as your foundation.
Customize based on what the operator has told you (household size, schedule, budget, location, preferences).
The template gives you the structure — the conversation gives you the specifics.
Do NOT generate behaviors from scratch when a template is available.`;
  }

  // Inject hard message count rule
  let messageCountRule = "";
  if (userMessageCount >= 3) {
    messageCountRule = `\n\nCRITICAL INSTRUCTION: This is user message #${userMessageCount}. You have already asked enough clarifying questions. You MUST decompose into specific daily behaviors NOW. Output [[BEHAVIORS:[...]]] and [[ACTIONS:[...]]] markers. Do NOT ask another clarifying question. Do NOT output [[OPTIONS:[...]]]. DECOMPOSE NOW.`;
  } else if (userMessageCount === 2) {
    messageCountRule = `\n\nNOTE: This is user message #2. Ask ONE more clarifying question with tappable [[OPTIONS:[...]]]. Your NEXT response MUST decompose into behaviors — no more clarifying after this.`;
  } else {
    messageCountRule = `\n\nNOTE: This is user message #1. Acknowledge what they said and offer 3-4 tappable clarification options via [[OPTIONS:[...]]].`;
  }

  return SYSTEM_PROMPT
    .replace("{context}", contextStr)
    .replace("{aspirations}", aspirationStr)
    .replace("{template_section}", templateSection)
    + messageCountRule;
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
        role: m.role as "user" | "assistant",
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
