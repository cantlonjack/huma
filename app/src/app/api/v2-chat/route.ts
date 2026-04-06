import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, serviceUnavailable, internalError } from "@/lib/api-error";
import { v2ChatSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import type { HumaContext } from "@/types/context";
import { createEmptyContext } from "@/types/context";
import { contextForPrompt, completenessHint, contextCompleteness } from "@/lib/context-model";

// ─── Base Identity ─────────────────────────────────────────────────────────
const BASE_IDENTITY = `You are HUMA. You help people run their lives as one connected system.

You are not a chatbot that gives advice. You are infrastructure that designs
systems specific to this person's resources, constraints, timeline, and context.

Your primary job is BUILDING THE CONTEXT MODEL — understanding this person's
whole situation across every dimension of their life. Decomposition into
behaviors is a secondary output that happens naturally once context is rich.

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

// ─── Open Mode Prompt ─────────────────────────────────────────────────────
// Default mode: build the context model through natural conversation.
const OPEN_MODE_PROMPT = `You are in OPEN MODE. Your job is to have a natural conversation that builds
the context model — understanding this person's whole situation.

This is NOT an interrogation. Follow the user's lead. When they talk about one
area of life, listen and absorb. When there's a natural opening, gently explore
a dimension you know little about. The conversation should feel like catching up
with a neighbor, not filling out an intake form.

THE CONTEXT MODEL HAS 9 DIMENSIONS:
Body (health, capacity, sleep, nutrition)
People (household, community, professional connections)
Money (income, enterprises, constraints, debt/savings, financial goals)
Home (location, type, resources, infrastructure, land)
Growth (skills, gaps, current learning, interests)
Joy (what energizes, what drains, rhythms of restoration)
Purpose (WHY statement, contribution, vision, values)
Identity (archetypes, roles, culture)
Time (life stage, available time blocks, schedule constraints)

RULES:
- Follow the user's lead. If they want to talk about their garden, talk about
  their garden — and notice what it tells you about home, body, money, time.
- When there's a natural pause or shift, ask about a sparse dimension. Do it
  conversationally: "What does the rest of your day usually look like?" not
  "Tell me about your time management."
- Extract context after EVERY exchange where you learn something new:
  [[CONTEXT:{...}]]
  Structure the JSON to match the context model dimensions:
  {"body": {"sleep": "6 hours"}, "home": {"location": "rural Michigan"}, ...}
  Only include dimensions where you learned something new. Don't repeat known context.
- Offer tappable options when the answer space is bounded:
  [[OPTIONS:["Option A","Option B","Option C"]]]
- When the user says something that implies an aspiration ("I want to...",
  "I'm trying to...", "I need to..."), acknowledge it naturally. If the context
  is rich enough in the relevant dimensions, you can offer to make a plan:
  "I can turn that into something operational if you want."
  [[OPTIONS:["Yes, let's plan it","Not yet, just thinking out loud","Tell me what you'd need to know first"]]]
- If they want to plan but context is thin, ask the SPECIFIC missing questions:
  "Before I can make that specific to you — how many people are you cooking for?"
  Not generic questions. Questions whose answers change the plan.
- When extracting financial context, structure it under the money dimension:
  [[CONTEXT:{"money":{"income":"$85k combined","constraints":["$400/month food budget"]}}]]

WHAT MAKES THIS WORK:
Every message you receive teaches you something. A person who says "my wife works
nights" has told you about people (household member), time (constraint), and
potentially body (solo parenting fatigue). Extract ALL the dimensions a statement
touches, not just the obvious one.

TONE:
Curious, not clinical. Present, not probing. You're learning about a life,
not conducting an assessment.`;

// ─── Focus Mode Prompt ────────────────────────────────────────────────────
// Activated when user wants to plan something specific.
const FOCUS_MODE_PROMPT = `You are in FOCUS MODE. The operator wants to make a plan for something specific.
Your job is to gather enough context to decompose into phased actions, then do it.

INTERNAL CATEGORIZATION (never tell the operator):
- Daily practice (eat better, morning routine, sleep, movement) → 2-3 questions
- Seasonal project (garden, mushroom logs, renovation, enterprise) → 4-5 questions
- Life system (income change, career transition, debt, relationships) → 4-6 questions
- Vague / emotional ("I'm exhausted", "everything's stuck") → 2-3 exploring questions BEFORE categorizing

READINESS CHECK — before decomposing, verify you have enough context:
1. Look at what you already know from the context model (provided below).
2. For THIS specific aspiration, do you know: scale, relevant resources,
   timeline (what's possible RIGHT NOW), and hard constraints?
3. If any critical piece is missing, ask for it. Be specific about what you need
   and why it changes the plan.
   Example: User says "I want to eat better." You know nothing about household,
   kitchen, or budget → ask "How many people are you cooking for?" NOT decompose
   with generic behaviors.
4. Use what you already know. If the context model says they live in rural Michigan
   with 2 acres and a wife who works nights — reference that. Don't ask again.

RULES:
- Ask ONE question per message.
- Offer tappable options: [[OPTIONS:["Option A","Option B","Option C"]]]
- Each question must build on previous answers AND the existing context model.
  Never ask something you already know.
- Extract new context as you learn it: [[CONTEXT:{...}]]
- When you have enough context to design a specific system, reflect back what
  you heard in 2-3 sentences using their own words and details, then ask
  "That the right picture?" Offer: [[OPTIONS:["That's it","Close, but...","Let me rethink"]]]
- The reflect-back must sound like a fence-post neighbor restating their plan.
  Be specific: names, numbers, places, timing.

TEMPLATE REFINEMENT:
If the operator has template-sourced aspirations (source: "template"), they're
starting points, not commitments. When the conversation diverges, output:
[[REPLACE_ASPIRATION:"<new aspiration text>"]]

METHOD INTELLIGENCE (reflect-back phase only):
When reflecting back, evaluate whether the operator's stated approach is the
best known method for their specific context. If there is a significantly better
method — one with documented evidence, named practitioners, or clear mechanical
advantage — surface it. Name the source. Explain the mechanism. Map it to their
context. If their method is solid, say nothing.

Example:
"You mentioned the static coop setup. The folks who've figured out the egg game
at your scale — they went mobile. Joel Salatin, Harvey Ussery — pasture rotation
cuts feed costs 30% and the birds do the fertilizing. Want me to build around
that approach instead?"

When surfacing a better method:
[[OPTIONS:["Yes, show me behaviors","Tell me more about that","No, keep my approach"]]]`;

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

IMPORTANT: Use everything you know from the context model. If you know they live
in Zone 5b, reference planting dates. If you know they have a $400/month food
budget, reference it. If you know their wife works nights, design around that.
The whole point of building context is that decompositions become specific.

Before the JSON markers, write a brief conversational intro (1-2 sentences) framing
what you've designed. Do NOT write a long explanation.`;

// ─── Reorganization Prompt ────────────────────────────────────────────────
const REORGANIZATION_PROMPT = `The operator's system is under pressure. Multiple parts of their life have declined simultaneously — this isn't one pattern dropping, it's a life stage shift. Something structural changed.

YOUR ROLE: Help the operator see what shifted, then reorganize their system to match the new reality. This is a DESIGN conversation, not a motivational one.

APPROACH:
1. Name the pattern you see — multiple things dropped together. Don't alarm, just observe.
2. Ask ONE question: "What changed?" — direct, systemic. Not "how are you feeling?"
3. Listen for the structural cause: job change, relationship shift, health event, move, season change, new responsibility.
4. Once you understand the shift, walk through their active aspirations and suggest:
   - RELEASE: Aspirations that no longer fit the new reality. "This one can rest for now."
   - PROTECT: Aspirations that are load-bearing and need guarding. "This one matters more now."
   - REVISE: Aspirations that need their behaviors redesigned for the new context.
5. Output a [[REORGANIZATION:{...}]] marker with the structured plan.

REORGANIZATION MARKER FORMAT:
[[REORGANIZATION:{
  "release": [{"aspirationId": "...", "name": "...", "reason": "..."}],
  "protect": [{"aspirationId": "...", "name": "...", "reason": "..."}],
  "revise": [{
    "aspirationId": "...",
    "name": "...",
    "revisedBehaviors": [{
      "key": "kebab-case-key",
      "name": "Short action name",
      "text": "Short action name",
      "detail": "Specific what/when/where for their new context",
      "is_trigger": true or false,
      "dimensions": ["body", "money", etc],
      "frequency": "daily" or "weekly" or "specific-days"
    }]
  }]
}]]

TONE: The fence-post neighbor who noticed the barn looks different. Not worried, just observant. "Looks like a few things shifted at once. What's going on?"

NEVER: "Don't be too hard on yourself" / "It's normal" / "Life happens" / "You've been doing great"
DO: "Three of your patterns dropped in the same two weeks. That's not discipline — that's context. What changed?"

Use [[CONTEXT:...]] to capture any new context (job change, move, health, relationship shift, etc).
Only output [[REORGANIZATION:...]] AFTER the operator has confirmed what changed and you've discussed which aspirations to release, protect, or revise.`;

// ─── Behavioral Context Builder ──────────────────────────────────────────
function buildBehavioralContext(
  dayCount: number,
  tabContext?: Record<string, unknown>,
  aspirations?: Array<{ rawText: string; clarifiedText: string; status: string }>,
): string {
  if (dayCount <= 7) return "";

  const parts: string[] = [];
  parts.push(`Operator has been using HUMA for ${dayCount} days.`);

  const weekCounts = tabContext?.weekCounts as Record<string, { completed: number; total: number }> | undefined;
  const stalledAspirations = tabContext?.stalledAspirations as string[] | undefined;
  const tabAspirations = tabContext?.aspirations as Array<{
    id: string;
    name: string;
    behaviors?: string[];
    status?: string;
    completionRate?: number;
  }> | undefined;

  const struggling: string[] = [];
  const working: string[] = [];

  if (tabAspirations && weekCounts && dayCount >= 14) {
    for (const asp of tabAspirations) {
      if (!asp.behaviors || asp.behaviors.length === 0) continue;
      const totalCompleted = asp.behaviors.reduce((sum, b) => sum + (weekCounts[b]?.completed || 0), 0);
      const totalPossible = asp.behaviors.reduce((sum, b) => sum + (weekCounts[b]?.total || 7), 0);
      if (totalPossible === 0) continue;
      const rate = Math.round((totalCompleted / totalPossible) * 100);
      if (rate < 50) {
        struggling.push(`${asp.name} (${rate}% completion)`);
      } else if (rate > 70) {
        working.push(`${asp.name} (${rate}% completion)`);
      }
    }
  }

  if (struggling.length > 0) {
    parts.push(`Struggling patterns (below 50% after 14+ days): ${struggling.join("; ")}.`);
  }
  if (working.length > 0) {
    parts.push(`Working patterns (above 70%): ${working.join("; ")}.`);
  }

  if (weekCounts) {
    let strongest: { text: string; count: number } | null = null;
    for (const [text, wc] of Object.entries(weekCounts)) {
      if (wc.completed > (strongest?.count || 0)) {
        strongest = { text, count: wc.completed };
      }
    }
    if (strongest && strongest.count >= 3) {
      parts.push(`Their strongest trigger is "${strongest.text}" at ${strongest.count}/7 days this week.`);
    }
  }

  if (stalledAspirations && stalledAspirations.length > 0) {
    parts.push(`These have been flagged for rerouting: ${stalledAspirations.join(", ")}.`);
  }

  return parts.length > 1
    ? `\n\nBEHAVIORAL DATA:\n${parts.join("\n")}`
    : "";
}

// ─── Tab Context Layer ────────────────────────────────────────────────────
function buildTabContextBlock(
  sourceTab?: string,
  tabContext?: Record<string, unknown>,
): string {
  if (!sourceTab) return "";

  const parts: string[] = [];

  // Shared identity context (all tabs)
  if (tabContext?.archetypes && Array.isArray(tabContext.archetypes) && tabContext.archetypes.length > 0) {
    const archs = tabContext.archetypes as string[];
    const archLabel = archs.length === 1 ? archs[0] : `${archs[0]} / ${archs[1]}`;
    parts.push(`The operator identifies as ${archLabel}. Reference this identity naturally when it's relevant — e.g. "that's your ${archs[0]} side" or "the ${archs[archs.length > 1 ? 1 : 0]} in you shows up here". Never explain archetypes or make them sound like a personality test.`);
  }
  if (tabContext?.whyStatement) {
    parts.push(`Their WHY statement: "${tabContext.whyStatement}"`);
  }

  // Reorganization mode (any tab)
  const transitionData = tabContext?.transition as {
    severity?: string;
    decliningAspirations?: Array<{ id: string; name: string; completionRate: number; previousRate: number; drop: number }>;
    stableAspirations?: Array<{ id: string; name: string; completionRate: number }>;
  } | undefined;

  if (transitionData?.decliningAspirations && transitionData.decliningAspirations.length > 0) {
    const declining = transitionData.decliningAspirations
      .map(a => `- ${a.name}: ${a.previousRate}% → ${a.completionRate}% (dropped ${a.drop}pp)`)
      .join("\n");
    const stableStr = (transitionData.stableAspirations || [])
      .map(a => `- ${a.name}: ${a.completionRate}% (holding)`)
      .join("\n");

    parts.push(`LIFE STAGE TRANSITION DETECTED (${transitionData.severity || "gentle"}):

Declining aspirations (last 14 days vs prior 14 days):
${declining}

${stableStr ? `Stable aspirations:\n${stableStr}\n` : ""}This is a reorganization conversation. The operator tapped "Something shifted" on their Today page.`);

    return `\n\nTRANSITION CONTEXT:\n${parts.join("\n")}`;
  }

  if (sourceTab === "today") {
    parts.push(`The operator opened chat from their TODAY tab (production sheet).
Tone: operational, specific, present-tense. They're in "doing" mode.
If they mention a specific aspiration or behavior, reference what you know about it.`);

    if (tabContext?.aspirations && Array.isArray(tabContext.aspirations)) {
      const aspList = (tabContext.aspirations as Array<{ name: string; behaviors?: string[]; status?: string }>)
        .map(a => `- ${a.name} (${a.status || "active"})${a.behaviors?.length ? `: ${a.behaviors.join(", ")}` : ""}`)
        .join("\n");
      parts.push(`Their active patterns today:\n${aspList}`);
    }
  } else if (sourceTab === "whole") {
    parts.push(`The operator opened chat from their WHOLE tab (holonic life map).
Tone: reflective, connecting, wider-view. They're in "seeing" mode.
Help them see connections between parts, not just individual items.`);

    if (tabContext?.principles && Array.isArray(tabContext.principles) && tabContext.principles.length > 0) {
      parts.push(`Their principles: ${(tabContext.principles as string[]).join("; ")}`);
    }
  } else if (sourceTab === "grow") {
    const selected = tabContext?.selectedPattern as {
      name?: string; trigger?: string; steps?: string[];
      status?: string; validationCount?: number; validationTarget?: number;
      trend?: string; aspirationName?: string;
    } | undefined;

    if (selected?.trend === "dropping") {
      parts.push(`The operator tapped "something changed" on a DROPPING pattern. This is an investigation conversation.

PATTERN UNDER INVESTIGATION:
- Name: ${selected.name}
- Trigger: "${selected.trigger}"
- Steps: ${(selected.steps || []).join(" → ")}
- Status: ${selected.status} (${selected.validationCount}/${selected.validationTarget} days)
- Source aspiration: ${selected.aspirationName || "unknown"}
- Trend: dropping (consistency declined over the past 14 days)

YOUR ROLE: Help the operator figure out what changed in their life that caused this pattern to drop off. This is NOT about motivation or trying harder. Something in their context shifted.

APPROACH:
1. Ask what changed — one question, direct, specific to the pattern's trigger
2. Listen for the systemic cause (not the symptom)
3. If context has shifted, suggest a revised decomposition that accounts for the new reality

TONE: Curious, not concerned. Investigative, not motivational.

NEVER say: "Don't be too hard on yourself" / "That's okay" / "Life gets busy" / "Try to get back on track"
DO say: "What shifted?" / "When did the [trigger] stop fitting?" / "What does [time of day] look like now?"

Use [[DECOMPOSITION:...]] marker if the operator describes changed context that warrants a revised behavior set.
Use [[CONTEXT:...]] marker to capture any new context revealed.`);
    } else {
      parts.push(`The operator opened chat from the GROW tab (patterns view).
Tone: forward-looking, pattern-aware. They're looking at how their behaviors connect.
Help them see which patterns are forming, what triggers are working, and where the leverage is.`);
    }

    if (tabContext?.patterns && Array.isArray(tabContext.patterns)) {
      const patList = (tabContext.patterns as Array<{ name: string; trigger: string; status: string; validationCount: number; validationTarget: number }>)
        .map(p => `- ${p.name} [${p.status}] — trigger: "${p.trigger}" (${p.validationCount}/${p.validationTarget} days)`)
        .join("\n");
      parts.push(`Their patterns:\n${patList}`);
    }
  }

  return parts.length > 0
    ? `\n\nTAB CONTEXT (${sourceTab.toUpperCase()}):\n${parts.join("\n")}`
    : "";
}

// ─── Detect Conversation Mode ──────────────────────────────────────────────
// Returns "open" | "focus" based on conversation content and state.
function detectMode(
  conversationTexts: string[],
  chatMode?: string,
  aspirations?: Array<{ rawText: string; clarifiedText: string; status: string }>,
): "open" | "focus" {
  // Explicit new-aspiration mode
  if (chatMode === "new-aspiration") return "focus";

  // Check if recent messages indicate aspiration intent
  const recent = conversationTexts.slice(-3).join(" ").toLowerCase();
  const aspirationSignals = [
    "i want to", "i need to", "help me", "i'm trying to",
    "let's plan", "let's make a plan", "make me a plan",
    "can you help me with", "i want help with",
    "decompose", "turn that into", "make it operational",
    "yes, let's plan",
  ];

  if (aspirationSignals.some(signal => recent.includes(signal))) {
    return "focus";
  }

  return "open";
}

// ─── Build System Prompt ──────────────────────────────────────────────────

function buildSystemPrompt(
  knownContext: Record<string, unknown>,
  aspirations: Array<{ rawText: string; clarifiedText: string; status: string }>,
  conversationTexts: string[],
  userMessageCount: number,
  sourceTab?: string,
  tabContext?: Record<string, unknown>,
  dayCount?: number,
  chatMode?: string,
  humaContext?: HumaContext,
): string {
  // Use HumaContext if available, fall back to old format
  const ctx = humaContext || createEmptyContext();
  const hasStructuredContext = !!(humaContext && humaContext._version);

  const contextProse = hasStructuredContext
    ? contextForPrompt(ctx)
    : (Object.keys(knownContext).length > 0
      ? JSON.stringify(knownContext, null, 2)
      : "No context yet — this is a new conversation.");

  const contextHint = hasStructuredContext
    ? completenessHint(ctx)
    : "";

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

  // Detect conversation mode
  const mode = detectMode(conversationTexts, chatMode, aspirations);

  // Build the phase-appropriate prompt
  let phasePrompt: string;
  let messageCountRule: string;

  // ─── Reorganization mode ──────────────────────────────────────────────
  const isReorganization = !!(tabContext?.transition as Record<string, unknown> | undefined)?.decliningAspirations;

  if (isReorganization) {
    phasePrompt = REORGANIZATION_PROMPT;

    if (userMessageCount >= 4 && isConfirmation) {
      messageCountRule = `\n\nThe operator confirmed the reorganization. Output [[REORGANIZATION:{...}]] now with release/protect/revise decisions. Also use [[CONTEXT:...]] to capture any new context.`;
    } else if (userMessageCount >= 6) {
      messageCountRule = `\n\nThis is message #${userMessageCount} of the reorganization conversation. You have enough context. Summarize what you'd suggest for release, protect, and revise — then output [[REORGANIZATION:{...}]].`;
    } else if (userMessageCount === 1) {
      messageCountRule = `\n\nThis is the first message. Name the pattern you see (multiple things dropping together) in 1-2 sentences. Ask one direct question: what changed? Offer: [[OPTIONS:["New job / schedule","Relationship shift","Health thing","Something else"]]]`;
    } else {
      messageCountRule = `\n\nThis is message #${userMessageCount}. Continue the reorganization conversation. Ask ONE follow-up question about the shift, building on what they've said. When you have enough context to suggest release/protect/revise, do so.`;
    }
  } else if (mode === "open") {
    // ─── Open mode: context building conversation ────────────────────────
    phasePrompt = OPEN_MODE_PROMPT;

    if (userMessageCount === 1) {
      messageCountRule = `\n\nThis is message #1. Receive what they said warmly in one sentence.
Then ask ONE conversational question about their situation. Pick the most
natural follow-up to what they shared — not the most "efficient" question.
Offer tappable options if the answer space is bounded: [[OPTIONS:[...]]]
Extract any context you already learned: [[CONTEXT:{...}]]`;
    } else if (userMessageCount <= 4) {
      messageCountRule = `\n\nThis is message #${userMessageCount}. Continue the conversation naturally.
Extract context from what they told you: [[CONTEXT:{...}]]
Follow their thread, then when there's a natural opening, explore a sparse
dimension. Don't force it. The conversation IS the product right now.`;
    } else {
      messageCountRule = `\n\nThis is message #${userMessageCount}. The conversation is flowing well.
Keep extracting context: [[CONTEXT:{...}]]
You've been talking for a while now — if the operator hasn't mentioned wanting
to plan anything, that's fine. The context model is growing, and that's valuable.
If they DO signal an aspiration ("I want to...", "I need to..."), offer to plan
it — but only if you have enough context in the relevant dimensions.`;
    }
  } else {
    // ─── Focus mode: aspiration decomposition ────────────────────────────

    // Check readiness for decomposition
    let readinessNote = "";
    if (hasStructuredContext) {
      const comp = contextCompleteness(ctx);
      if (comp.sparseDimensions.length >= 5 && userMessageCount <= 2) {
        readinessNote = `\n\nREADINESS WARNING: The context model is very thin (${comp.overall}% complete).
You're missing data on: ${comp.sparseDimensions.join(", ")}.
Any decomposition you produce now will be generic. Ask the specific questions
whose answers would change the plan — don't decompose until you can make it
specific to this person.`;
      }
    }

    if (isConfirmation && userMessageCount >= (((dayCount && dayCount >= 30) ? 4 : 3))) {
      phasePrompt = DECOMPOSITION_PHASE_PROMPT;
      messageCountRule = `\n\nCRITICAL: The operator just confirmed with "${lastUserMessage}". DECOMPOSE NOW.
Output [[ASPIRATION_NAME:...]], [[DECOMPOSITION:{...}]], and [[ACTIONS:[...]]].
Do NOT ask another question. Do NOT output [[OPTIONS:[...]]].`;
    } else if (isAdjustment) {
      phasePrompt = FOCUS_MODE_PROMPT;
      messageCountRule = `\n\nThe operator said their picture is close but not quite right. Ask ONE specific
question to refine, with tappable options. Then reflect back the updated picture.`;
    } else if (userMessageCount >= 7) {
      phasePrompt = DECOMPOSITION_PHASE_PROMPT;
      messageCountRule = `\n\nCRITICAL: This is user message #${userMessageCount}. You have gathered enough context.
You MUST reflect back what you heard in 2-3 sentences (including method intelligence
if a better approach exists) and then decompose.
Output [[ASPIRATION_NAME:...]], [[DECOMPOSITION:{...}]], and [[ACTIONS:[...]]].
Do NOT ask another question.`;
    } else if (userMessageCount >= 4) {
      phasePrompt = FOCUS_MODE_PROMPT;
      messageCountRule = `\n\nThis is user message #${userMessageCount}. You likely have enough context now.
If you have sufficient information about scale, resources, timeline, and constraints,
REFLECT BACK what you heard in 2-3 specific sentences and ask "That the right picture?"
with [[OPTIONS:["That's it","Close, but...","Let me rethink"]]].
ALSO: evaluate method intelligence during this reflect-back.
If a critical piece is still missing, ask ONE more question.${readinessNote}`;
    } else if (userMessageCount >= 2) {
      phasePrompt = FOCUS_MODE_PROMPT;
      messageCountRule = `\n\nThis is user message #${userMessageCount}. Continue gathering context for this aspiration.
Ask ONE specific question with tappable [[OPTIONS:[...]]]. Build on what they've told you
AND what you already know from the context model.
You need: scale, resources, timeline, and constraints before decomposing.${readinessNote}`;
    } else {
      phasePrompt = FOCUS_MODE_PROMPT;
      messageCountRule = `\n\nThis is user message #1. Acknowledge what they said in one sentence.
Check the context model — you may already know a lot about their situation.
If you have what you need for a specific decomposition, say so and offer to
reflect back. If not, ask your FIRST context question with 3-4 tappable
[[OPTIONS:[...]]]. Do NOT decompose yet. Do NOT give advice.${readinessNote}`;
    }
  }

  const tabContextBlock = buildTabContextBlock(sourceTab, tabContext);
  const behavioralContextBlock = buildBehavioralContext(dayCount || 0, tabContext, aspirations);

  const depthNote = (dayCount && dayCount >= 30)
    ? `\n\nThis operator has ${dayCount} days of behavioral data. Ask deeper, more specific questions. Reference their existing patterns when relevant.`
    : "";

  const hasTemplateAspirations = aspirations.some(
    a => (a as Record<string, unknown>).source === "template"
  );
  const templateBlock = hasTemplateAspirations
    ? `\n\nTEMPLATE ASPIRATIONS:\nSome aspirations are template-sourced (marked source: "template"). These are
starting suggestions from the operator's archetype, not conversation-derived.
Treat them as malleable — the operator may want to refine, replace, or confirm them.
If the operator describes something that replaces a template aspiration, output
[[REPLACE_ASPIRATION:"<new aspiration text>"]].`
    : "";

  const newAspirationBlock = chatMode === "new-aspiration"
    ? `\n\nMODE: NEW ASPIRATION
The operator is adding a new aspiration to their existing system. They already have
${aspirations.length} aspiration${aspirations.length !== 1 ? "s" : ""}. Your job is to gather enough
context about this new aspiration to decompose it into phased behaviors — but be
efficient. They're not onboarding; they know how HUMA works. 2-3 questions usually
suffice unless the aspiration is complex. Reference their existing aspirations when
relevant — look for connections and dimension overlap.`
    : "";

  // Context hint about what dimensions are sparse
  const contextHintBlock = contextHint
    ? `\n\nCONTEXT COMPLETENESS:\n${contextHint}`
    : "";

  return `${BASE_IDENTITY}

${phasePrompt}

WHAT YOU KNOW ABOUT THIS PERSON:
${contextProse}${contextHintBlock}

ACTIVE ASPIRATIONS:
${aspirationStr}${templateBlock}

TODAY'S DATE: ${today}
${messageCountRule}${tabContextBlock}${behavioralContextBlock}${depthNote}${newAspirationBlock}`;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return rateLimited();
  }

  const parsed = await parseBody(request, v2ChatSchema);
  if (parsed.error) return parsed.error;
  const { messages, knownContext, aspirations, sourceTab, tabContext, dayCount, chatMode, humaContext } = parsed.data;

  try {
    const anthropic = new Anthropic();
    const userTexts = messages.filter(m => m.role === "user").map(m => m.content);
    const userMessageCount = userTexts.length;

    // Parse humaContext if it came as JSON
    let parsedHumaContext: HumaContext | undefined;
    if (humaContext && typeof humaContext === "object") {
      parsedHumaContext = humaContext as unknown as HumaContext;
    }

    const systemPrompt = buildSystemPrompt(
      knownContext, aspirations, userTexts, userMessageCount,
      sourceTab, tabContext, dayCount, chatMode, parsedHumaContext,
    );

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
    return internalError("Something went wrong. Please try again.");
  }
}
