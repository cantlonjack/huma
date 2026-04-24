// Sanity check for compressed life-graph encoding.
// Run: npx tsx scripts/sanity-check-encoding.ts
// Or:  npx vite-node scripts/sanity-check-encoding.ts
//
// Prints encodeFolded and encodeLifeGraph(input, "aspiration", aspId) for a
// realistic HumaContext + 3 aspirations + patterns + capacity state. Read the
// output by eye — does it convey the user's life clearly in <500 tokens?

import { encodeFolded, encodeLifeGraph, type EncodingInput } from "../src/lib/context-encoding";
import { createEmptyContext } from "../src/types/context";
import type { HumaContext } from "../src/types/context";
import type { Aspiration, Pattern } from "../src/types/v2";
import type { CapitalScore } from "../src/engine/canvas-types";

function buildContext(): HumaContext {
  const ctx = createEmptyContext();
  ctx.body = { sleep: "6h most nights", conditions: ["bad knee"] };
  ctx.people = {
    household: [
      { name: "Sarah", relationship: "wife" },
      { name: "Lena", relationship: "daughter", age: 6 },
    ],
  };
  ctx.money = {
    income: "combined ~$85k",
    debt: "$22k student loans",
    financialGoal: "quit day job by 2028",
  };
  ctx.home = { location: "rural Michigan", land: "2 acres sandy soil" };
  ctx.growth = { currentLearning: ["cheesemaking", "beekeeping"] };
  ctx.joy = { sources: ["garden mornings", "reading before bed"] };
  ctx.purpose = { whyStatement: "Build a self-sufficient homestead for our family" };
  ctx.identity = { archetypes: ["Homesteader"] };
  ctx.capacityState = {
    awareness: "emerging",
    honesty: "developing",
    care: "developing",
    agency: "emerging",
    humility: "developing",
  };
  return ctx;
}

const aspirations: Aspiration[] = [
  {
    id: "asp-homestead",
    rawText: "Build self-sufficient homestead",
    clarifiedText: "Build self-sufficient homestead",
    title: "Homestead build",
    behaviors: [
      {
        key: "morning-chores",
        text: "Morning chore round",
        frequency: "daily",
        enabled: true,
        detail: "Water, feed, eggs, walk the perimeter",
        dimensions: [
          { dimension: "body", direction: "builds", reasoning: "" },
          { dimension: "home", direction: "builds", reasoning: "" },
        ],
      },
      {
        key: "sunday-planning",
        text: "Weekly planning session",
        frequency: "weekly",
        enabled: true,
        dimensions: [{ dimension: "purpose", direction: "builds", reasoning: "" }],
      },
    ],
    dimensionsTouched: ["body", "home", "purpose"],
    status: "active",
    stage: "active",
  },
  {
    id: "asp-write",
    rawText: "Write daily",
    clarifiedText: "Write daily",
    title: "Morning writing",
    behaviors: [
      {
        key: "morning-pages",
        text: "Morning pages",
        frequency: "daily",
        enabled: true,
        detail: "Two longhand pages before email",
        dimensions: [{ dimension: "growth", direction: "builds", reasoning: "" }],
      },
    ],
    dimensionsTouched: ["growth"],
    status: "active",
    stage: "active",
  },
  {
    id: "asp-pay-debt",
    rawText: "Pay off student loans",
    clarifiedText: "Pay off student loans by 2027",
    title: "Debt freedom",
    behaviors: [
      {
        key: "weekly-spend-review",
        text: "Review weekly spend",
        frequency: "weekly",
        enabled: true,
        dimensions: [{ dimension: "money", direction: "protects", reasoning: "" }],
      },
    ],
    dimensionsTouched: ["money"],
    status: "active",
    stage: "active",
  },
];

const patterns: Pattern[] = [
  {
    id: "p-morning-chores",
    aspirationId: "asp-homestead",
    name: "Dawn chore loop",
    trigger: "alarm 5:45",
    steps: [
      { behaviorKey: "morning-chores", text: "Water", order: 1, isTrigger: true },
      { behaviorKey: "morning-chores", text: "Feed", order: 2, isTrigger: false },
      { behaviorKey: "morning-chores", text: "Eggs", order: 3, isTrigger: false },
    ],
    timeWindow: "5:45-6:30 AM",
    validationCount: 18,
    validationTarget: 30,
    status: "working",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p-morning-pages",
    aspirationId: "asp-write",
    name: "Morning pages ritual",
    trigger: "kettle on",
    steps: [
      { behaviorKey: "morning-pages", text: "Pages", order: 1, isTrigger: true },
    ],
    timeWindow: "6:30-7:00 AM",
    validationCount: 22,
    validationTarget: 30,
    status: "working",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// REGEN-01 literal sweep (Plan 02-03): sample operator is fully formed, so
// confidence: 1 matches the "well-known" shader tier for sanity-check output.
const capitalScores: CapitalScore[] = [
  { form: "financial", score: 2.1, note: "", confidence: 1 },
  { form: "material", score: 3.2, note: "", confidence: 1 },
  { form: "living", score: 3.4, note: "", confidence: 1 },
  { form: "social", score: 4.1, note: "", confidence: 1 },
  { form: "intellectual", score: 3.3, note: "", confidence: 1 },
  { form: "experiential", score: 2.7, note: "", confidence: 1 },
  { form: "spiritual", score: 3.6, note: "", confidence: 1 },
  { form: "cultural", score: 2.2, note: "", confidence: 1 },
];

const behaviorCounts: Record<string, { completed: number; total: number }> = {
  "asp-homestead:morning-chores": { completed: 18, total: 21 },
  "asp-homestead:sunday-planning": { completed: 2, total: 3 },
  "asp-write:morning-pages": { completed: 14, total: 21 },
  "asp-pay-debt:weekly-spend-review": { completed: 1, total: 3 },
};

const input: EncodingInput = {
  context: buildContext(),
  aspirations,
  patterns,
  capitalScores,
  dayCount: 42,
  behaviorCounts,
};

const folded = encodeFolded(input);
const aspirationExpanded = encodeLifeGraph(input, "aspiration", "asp-homestead");

// Rough char-to-token approximation for English: ~4 chars/token
function approxTokens(s: string): number {
  return Math.round(s.length / 4);
}

console.log("═══════════════════════════════════════════════════════════════");
console.log("FOLDED ENCODING (Level 0)");
console.log("═══════════════════════════════════════════════════════════════");
console.log(folded);
console.log("");
console.log(`chars: ${folded.length}   approx tokens: ${approxTokens(folded)}`);
console.log("");
console.log("═══════════════════════════════════════════════════════════════");
console.log("ASPIRATION-EXPANDED (Level 1) — focus: Homestead build");
console.log("═══════════════════════════════════════════════════════════════");
console.log(aspirationExpanded);
console.log("");
console.log(`chars: ${aspirationExpanded.length}   approx tokens: ${approxTokens(aspirationExpanded)}`);
