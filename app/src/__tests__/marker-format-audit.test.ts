/**
 * TUNE iteration: Phase marker format consistency audit
 * Verifies all transition instructions emit canonical markers
 * that the parser (markers.ts) can consume.
 */
import { describe, it, expect } from "vitest";
import { parseMarkers } from "@/lib/markers";
import { PHASE_TRANSITION_INSTRUCTION, PHASE_PROMPTS, buildFullPrompt } from "@/engine/phases";
import type { Phase } from "@/engine/types";

// Canonical markers defined by the system
const CANONICAL_PHASES = [
  "holistic-context",
  "landscape",
  "enterprise-map",
  "nodal-interventions",
  "operational-design",
  "complete",
] as const;

const CANONICAL_CONTEXTS = [
  "field-type:land",
  "field-type:universal",
  "field-type:hybrid",
  "ikigai-synthesis",
  "holistic-synthesis",
  "landscape-synthesis",
  "enterprises",
  "nodal-interventions",
  "operational-design",
] as const;

// 10 diverse synthetic transition outputs to parse
const SYNTHETIC_TRANSITIONS = [
  // 1. Ikigai → Holistic Context (land operator)
  {
    label: "Ikigai→Holistic (land operator, Sarah)",
    text: `The woodworking — that's the thread. Twenty years of building with your hands, and now you want those hands in the soil too. There's something about the way you talk about the workshop that tells me this isn't a hobby. It's how you think.\n\nNow I want to understand what you're reaching for — not goals, but what quality of life actually means to you.\n\n[[PHASE:holistic-context]]\n[[CONTEXT:ikigai-synthesis]]Builder and grower at heart. Twenty years of carpentry — precision, patience, working with living material. Drawn to ecological restoration and teaching. Community needs local food access and repair skills. Sustainability through diversified small-scale production on her 7 acres.`,
    expectedPhase: "holistic-context",
    expectedContexts: ["ikigai-synthesis"],
  },
  // 2. Holistic Context → Landscape (universal operator)
  {
    label: "Holistic→Landscape (universal, UX designer)",
    text: `Family presence and creative work — those aren't competing. They're the same thing expressed in different hours of the day. The tension is real though: you want deep focus AND you want to be the parent who's there at pickup.\n\nLet me understand your situation more fully — the whole landscape of what you're working with.\n\n[[CONTEXT:field-type:universal]]\n[[CONTEXT:holistic-synthesis]]Career in UX design, seeking balance between deep creative work and family presence. Won't sacrifice school pickups or bedtime. Production through design consulting and teaching. Future resource base: financial independence within 4 years, preserved creative practice, strong marriage.\n[[PHASE:landscape]]`,
    expectedPhase: "landscape",
    expectedContexts: ["field-type:universal", "holistic-synthesis"],
  },
  // 3. Holistic Context → Landscape (land operator)
  {
    label: "Holistic→Landscape (land, regenerative rancher)",
    text: `Zero debt and soil health — you keep coming back to those two. They're your non-negotiables. Everything else flexes around them.\n\nNow I want to walk through your place. Tell me about the land.\n\n[[CONTEXT:field-type:land]]\n[[CONTEXT:holistic-synthesis]]Quality of life centered on outdoor physical work and family meals together. Won't sacrifice morning ranch time or Sunday rest. Production through livestock, direct sales, and ecological restoration. Resource base commitment: soil health across all paddocks, debt-free operation, preserved family rhythms.\n[[PHASE:landscape]]`,
    expectedPhase: "landscape",
    expectedContexts: ["field-type:land", "holistic-synthesis"],
  },
  // 4. Holistic Context → Landscape (hybrid)
  {
    label: "Holistic→Landscape (hybrid, part-time homesteader)",
    text: `You're holding two worlds — the remote tech job that pays the bills and the 3 acres that feeds your soul. That's not a contradiction. That's a design problem.\n\nLet's look at both landscapes.\n\n[[CONTEXT:field-type:hybrid]]\n[[CONTEXT:holistic-synthesis]]Dual-track life: remote software work provides financial stability, 3-acre homestead provides purpose and food. QoL: no more than 30hr/week tech, hands dirty by noon. Future: transition to 20hr tech within 2 years. Won't sacrifice health insurance or kids' college savings.\n[[PHASE:landscape]]`,
    expectedPhase: "landscape",
    expectedContexts: ["field-type:hybrid", "holistic-synthesis"],
  },
  // 5. Landscape → Enterprise Map (land)
  {
    label: "Landscape→Enterprise (land, market gardener)",
    text: `Seven acres of south-facing clay-loam in the Willamette Valley with year-round creek access. That's a lot to work with. The buildings need attention but the bones are solid. And those existing fruit trees — they've been telling you something for years.\n\nHere's what I see for enterprises that fit who you are and what this place affords.\n\n[[PHASE:enterprise-map]]\n[[CONTEXT:landscape-synthesis]]7 acres Willamette Valley, USDA Zone 8b. South-facing slope, clay-loam soils with good organic matter in upper field. Year-round creek on north boundary. Existing infrastructure: barn (needs roof), greenhouse frame, chicken coop. 12 mature fruit trees (apple, pear, plum). Access: gravel drive, 15 min to farmer's market. Strengths: water, soil biology, existing trees. Constraints: barn roof, fencing gaps, no cold storage. Key leverage: creek corridor fencing enables rotational grazing AND riparian restoration simultaneously.`,
    expectedPhase: "enterprise-map",
    expectedContexts: ["landscape-synthesis"],
  },
  // 6. Landscape → Enterprise Map (universal)
  {
    label: "Landscape→Enterprise (universal, career pivot)",
    text: `Strong identity, relationships under pressure, finances stable but fragile, time completely consumed by the corporate role. The leverage is in the time dimension — free up 10 hours a week and everything else starts breathing.\n\nLet me show you what could work.\n\n[[PHASE:enterprise-map]]\n[[CONTEXT:landscape-synthesis]]Identity: strong sense of self as educator and maker. Relationships: marriage strained by work hours, kids (8, 11) need more presence. Finances: $85k salary, $12k savings, mortgage manageable. Time: 55hr/week corporate, zero creative time. Energy: depleted by commute and meetings. Health: declining, stress-related. Location: suburban, 45min commute. Joy: woodworking shop unused for 8 months. Strengths: deep teaching skill, maker expertise, stable income. Constraints: mortgage, health insurance need. Leverage: negotiate remote 3 days/week → reclaim 6 hours → restart woodworking → rebuild energy.`,
    expectedPhase: "enterprise-map",
    expectedContexts: ["landscape-synthesis"],
  },
  // 7. Enterprise Map → Nodal Interventions
  {
    label: "Enterprise→Nodal (3 enterprises selected)",
    text: `Three enterprises, and they feed each other. The market garden anchors your weekly rhythm and cash flow. The laying hens cycle nutrients back to the garden and add a second revenue stream. And the carpentry — that's your multiplier, the thing only you can do in this valley.\n\nNow — where do you start? Not everything at once. Let's find the one move that cascades.\n\n[[PHASE:nodal-interventions]]\n[[CONTEXT:enterprises]]Market garden (no-dig, 0.5 acre) — anchor enterprise. Startup: $3,200 (beds, irrigation, seed). Labor: 25hr/week peak season. Revenue: $24-38k year 1 via farmer's market + 2 restaurants. Fits her hands-in-soil need and feeds the family.\nPastured laying hens (200 birds) — partner enterprise. Startup: $4,800 (mobile coop, fencing, birds). Labor: 8hr/week. Revenue: $12-18k via farm-gate + market. Cycles nutrients to garden beds, uses existing pasture.\nCustom carpentry — multiplier enterprise. Startup: $800 (materials, not tools — she has those). Labor: 10hr/week. Revenue: $15-25k via local commissions. Uses 20 years of skill. Builds social + cultural capital in the valley.`,
    expectedPhase: "nodal-interventions",
    expectedContexts: ["enterprises"],
  },
  // 8. Nodal Interventions → Operational Design
  {
    label: "Nodal→Operational (cascade chains defined)",
    text: `Three moves. Fence the creek corridor this month — that single action enables rotational grazing, starts riparian recovery, and creates the conversation starter with your neighbor about shared fence costs. Build the first 12 no-dig beds next month. Convert the outbuilding to egg grading in month three.\n\nNow let's design your week.\n\n[[PHASE:operational-design]]\n[[CONTEXT:nodal-interventions]]1. Fence creek corridor (Month 1) — $1,200 materials, 40 labor hours. Cascade: enables rotation → soil biology recovers → neighbor conversation about shared costs → first direct sales relationship.\n2. Build 12 no-dig beds (Month 2) — $800 materials, 30 labor hours. Cascade: first harvest in 8 weeks → farmer's market presence → restaurant outreach → year-round production planning.\n3. Convert outbuilding to egg grading (Month 3) — $600 materials, 20 labor hours. Cascade: compliant egg sales → farm-gate signage → CSA egg-share option → community trust building.`,
    expectedPhase: "operational-design",
    expectedContexts: ["nodal-interventions"],
  },
  // 9. Operational Design → Complete
  {
    label: "Operational→Complete (weekly rhythm delivered)",
    text: `Monday is your planning day. Tuesday through Thursday, you're in the field by 6 and done by 2. Friday is carpentry. Saturday is market day. Sunday is rest — non-negotiable.\n\nEvery Sunday evening, one question: how many evenings this week were you free by 4? That's your validation. If the number drops below 5, we look at the system, not at you.\n\nYour map is ready.\n\n[[PHASE:complete]]\n[[CONTEXT:operational-design]]Weekly rhythm: Mon — planning + admin (8-12). Tue-Thu — field work: garden (6-11), hens (11-12), lunch break (12-1), garden/maintenance (1-2), hard stop at 2pm. Fri — carpentry workshop (8-3). Sat — farmer's market (5am-1pm), rest afternoon. Sun — rest day, non-negotiable. QoL validation: evenings free by 4pm target 5/7 nights. Weekly check every Sunday. If below target, adjust system (batch tasks, defer low-priority maintenance) not effort. Seasonal arc: Spring — garden establishment + first market. Summer — peak production, add restaurant accounts. Fall — season extension planning, carpentry ramp-up. Winter — carpentry focus, garden rest, planning for year 2.`,
    expectedPhase: null, // complete sets isComplete, not phase
    expectedContexts: ["operational-design"],
    expectedComplete: true,
  },
  // 10. Edge case: all markers in compact format (no newlines between)
  {
    label: "Edge: compact marker format (no newlines)",
    text: `Let's look at what this place affords.[[CONTEXT:field-type:land]][[CONTEXT:holistic-synthesis]]Soil-first, family-centered, zero debt commitment.[[PHASE:landscape]]`,
    expectedPhase: "landscape",
    expectedContexts: ["field-type:land", "holistic-synthesis"],
  },
];

describe("TUNE: Phase marker format consistency", () => {
  it("transition instruction references all canonical PHASE markers", () => {
    for (const phase of CANONICAL_PHASES) {
      expect(PHASE_TRANSITION_INSTRUCTION).toContain(`[[PHASE:${phase}]]`);
    }
  });

  it("transition instruction references all canonical CONTEXT markers", () => {
    for (const ctx of CANONICAL_CONTEXTS) {
      expect(PHASE_TRANSITION_INSTRUCTION).toContain(`[[CONTEXT:${ctx}]]`);
    }
  });

  it("holistic-context phase prompt includes field-type instruction", () => {
    const prompt = PHASE_PROMPTS["holistic-context"];
    expect(prompt).toContain("[[CONTEXT:field-type:land]]");
    expect(prompt).toContain("[[CONTEXT:field-type:universal]]");
    expect(prompt).toContain("[[CONTEXT:field-type:hybrid]]");
  });

  describe("10 synthetic transitions parse correctly", () => {
    for (const tc of SYNTHETIC_TRANSITIONS) {
      it(`parses: ${tc.label}`, () => {
        const result = parseMarkers(tc.text);

        // Phase marker
        if (tc.expectedComplete) {
          expect(result.isComplete).toBe(true);
          expect(result.phase).toBeNull();
        } else {
          expect(result.phase).toBe(tc.expectedPhase);
        }

        // Context markers
        const extractedTypes = result.capturedContexts.map((c) => c.type);
        for (const ctx of tc.expectedContexts) {
          expect(extractedTypes).toContain(ctx);
        }

        // Each context has non-empty value (except field-type which is key:value format)
        for (const captured of result.capturedContexts) {
          if (!captured.type.startsWith("field-type:")) {
            expect(captured.value.length).toBeGreaterThan(0);
          }
        }

        // Clean text has no markers
        expect(result.clean).not.toContain("[[PHASE:");
        expect(result.clean).not.toContain("[[CONTEXT:");
      });
    }
  });

  it("buildFullPrompt includes transition instructions for every phase", () => {
    const phases: Phase[] = [
      "ikigai",
      "holistic-context",
      "landscape",
      "enterprise-map",
      "nodal-interventions",
      "operational-design",
    ];
    for (const phase of phases) {
      const prompt = buildFullPrompt(phase, {});
      expect(prompt).toContain("[[PHASE:");
      expect(prompt).toContain("[[CONTEXT:");
      expect(prompt).toContain("[[CANVAS_DATA:");
    }
  });

  it("transition instruction maps each phase transition to CONTEXT + CANVAS_DATA + PHASE", () => {
    // Verify the explicit mapping table covers all 6 transitions
    const mappings = [
      { context: "ikigai-synthesis", canvas: "ikigai", phase: "holistic-context" },
      { context: "holistic-synthesis", canvas: "holistic", phase: "landscape" },
      { context: "landscape-synthesis", canvas: "landscape", phase: "enterprise-map" },
      { context: "enterprises", canvas: "enterprises", phase: "nodal-interventions" },
      { context: "nodal-interventions", canvas: "nodal", phase: "operational-design" },
      { context: "operational-design", canvas: "operational", phase: "complete" },
    ];
    for (const m of mappings) {
      expect(PHASE_TRANSITION_INSTRUCTION).toContain(`[[CONTEXT:${m.context}]]`);
      expect(PHASE_TRANSITION_INSTRUCTION).toContain(`[[CANVAS_DATA:${m.canvas}]]`);
      expect(PHASE_TRANSITION_INSTRUCTION).toContain(`[[PHASE:${m.phase}]]`);
    }
  });

  it("no non-canonical markers exist in transition instruction", () => {
    const phaseMarkers =
      PHASE_TRANSITION_INSTRUCTION.match(/\[\[PHASE:([\w-]+)\]\]/g) || [];
    for (const m of phaseMarkers) {
      const id = m.match(/\[\[PHASE:([\w-]+)\]\]/)![1];
      expect(CANONICAL_PHASES as readonly string[]).toContain(id);
    }

    const ctxMarkers =
      PHASE_TRANSITION_INSTRUCTION.match(
        /\[\[CONTEXT:([\w-]+(?::[\w-]+)?)\]\]/g,
      ) || [];
    for (const m of ctxMarkers) {
      const id = m.match(/\[\[CONTEXT:([\w-]+(?::[\w-]+)?)\]\]/)![1];
      expect(CANONICAL_CONTEXTS as readonly string[]).toContain(id);
    }
  });
});
