import { describe, it, expect } from "vitest";
import { mergeContext, contextForPrompt } from "@/lib/context-model";
import { createEmptyContext } from "@/types/context";
import type { HumaContext } from "@/types/context";

describe("mergeContext", () => {
  it("overwrites shallow scalar fields", () => {
    const existing = createEmptyContext();
    existing.body.sleep = "8 hours";

    const result = mergeContext(existing, { body: { sleep: "6 hours" } });
    expect(result.body.sleep).toBe("6 hours");
  });

  it("deep-merges nested objects without clobbering siblings", () => {
    const existing = createEmptyContext();
    existing.people.household = [{ name: "Sarah", relationship: "wife" }];

    const result = mergeContext(existing, {
      people: { community: [{ name: "Dave", relationship: "neighbor" }] },
    });

    expect(result.people.household).toHaveLength(1);
    expect(result.people.household![0].name).toBe("Sarah");
    expect(result.people.community).toHaveLength(1);
    expect(result.people.community![0].name).toBe("Dave");
  });

  it("merges arrays by name — updates existing, appends new", () => {
    const existing = createEmptyContext();
    existing.people.household = [
      { name: "Sarah", relationship: "wife" },
      { name: "Lena", relationship: "daughter" },
    ];

    const result = mergeContext(existing, {
      people: {
        household: [
          { name: "Sarah", relationship: "wife", detail: "works nights" },
          { name: "Tom", relationship: "son" },
        ],
      },
    });

    expect(result.people.household).toHaveLength(3);
    const sarah = result.people.household!.find(p => p.name === "Sarah");
    expect(sarah?.detail).toBe("works nights");
    expect(result.people.household!.find(p => p.name === "Lena")).toBeDefined();
    expect(result.people.household!.find(p => p.name === "Tom")).toBeDefined();
  });

  it("deduplicates string arrays", () => {
    const existing = createEmptyContext();
    existing.joy.sources = ["reading", "gardening"];

    const result = mergeContext(existing, {
      joy: { sources: ["gardening", "cooking"] },
    });

    expect(result.joy.sources).toEqual(["reading", "gardening", "cooking"]);
  });

  it("tracks sources for every field change", () => {
    const existing = createEmptyContext();

    const result = mergeContext(
      existing,
      { body: { sleep: "6 hours" }, home: { location: "rural Michigan" } },
      "conversation",
      "msg-123",
    );

    expect(result._sources.length).toBeGreaterThanOrEqual(2);
    const sleepSource = result._sources.find(s => s.fieldPath === "body.sleep");
    expect(sleepSource).toBeDefined();
    expect(sleepSource!.value).toBe("6 hours");
    expect(sleepSource!.source).toBe("conversation");
    expect(sleepSource!.messageId).toBe("msg-123");
  });

  it("empty context + extracted → extracted wins", () => {
    const existing = createEmptyContext();
    const extracted = {
      body: { sleep: "7 hours", nutrition: "animal-based" },
      home: { location: "Portland OR" },
    };

    const result = mergeContext(existing, extracted);
    expect(result.body.sleep).toBe("7 hours");
    expect(result.body.nutrition).toBe("animal-based");
    expect(result.home.location).toBe("Portland OR");
  });

  it("existing context + empty extracted → existing preserved", () => {
    const existing = createEmptyContext();
    existing.body.sleep = "8 hours";
    existing.home.location = "Detroit";

    const result = mergeContext(existing, {});
    expect(result.body.sleep).toBe("8 hours");
    expect(result.home.location).toBe("Detroit");
  });

  it("preserves _version from existing context", () => {
    const existing = createEmptyContext();
    existing._version = 1;

    const result = mergeContext(existing, { body: { sleep: "6 hours" } });
    expect(result._version).toBe(1);
  });
});

describe("contextForPrompt", () => {
  it("returns 'No context yet' for empty context", () => {
    const ctx = createEmptyContext();
    const result = contextForPrompt(ctx);
    expect(result).toBe("No context yet — this is a new conversation.");
  });

  it("renders full context with all sections", () => {
    const ctx = createEmptyContext();
    ctx.purpose.whyStatement = "Build a self-sufficient homestead";
    ctx.purpose.values = ["independence", "community"];
    ctx.identity.archetypes = ["Homesteader"];
    ctx.people.household = [{ name: "Sarah", relationship: "wife", detail: "works nights" }];
    ctx.home.location = "rural Michigan";
    ctx.home.land = "2 acres";
    ctx.money.income = "$85k combined";
    ctx.money.constraints = ["$400/month food budget"];
    ctx.body.sleep = "6 hours";
    ctx.growth.skills = [{ name: "carpentry", level: "competent" }];
    ctx.joy.sources = ["gardening", "reading"];
    ctx.time.stage = "mid-career";

    const result = contextForPrompt(ctx);
    expect(result).toContain("IDENTITY & PURPOSE:");
    expect(result).toContain("Build a self-sufficient homestead");
    expect(result).toContain("PEOPLE:");
    expect(result).toContain("Sarah (wife)");
    expect(result).toContain("works nights");
    expect(result).toContain("HOME & RESOURCES:");
    expect(result).toContain("rural Michigan");
    expect(result).toContain("MONEY:");
    expect(result).toContain("$85k combined");
    expect(result).toContain("BODY:");
    expect(result).toContain("Sleep: 6 hours");
    expect(result).toContain("GROWTH:");
    expect(result).toContain("carpentry (competent)");
    expect(result).toContain("JOY:");
    expect(result).toContain("gardening");
    expect(result).toContain("TIME & SCHEDULE:");
    expect(result).toContain("mid-career");
  });

  it("only includes sections that have data", () => {
    const ctx = createEmptyContext();
    ctx.body.sleep = "8 hours";

    const result = contextForPrompt(ctx);
    expect(result).toContain("BODY:");
    expect(result).toContain("Sleep: 8 hours");
    expect(result).not.toContain("PEOPLE:");
    expect(result).not.toContain("MONEY:");
    expect(result).not.toContain("HOME & RESOURCES:");
  });

  it("renders decisions with reasoning and outcomes", () => {
    const ctx = createEmptyContext();
    ctx.decisions = [{
      id: "dec-1",
      date: "2026-03-15",
      description: "Build temporary sheep shelter",
      reasoning: "Saves $2,200 for barn fund",
      frameworksSurfaced: ["weak_link"],
      followUpDue: "2026-04-26",
    }];

    const result = contextForPrompt(ctx);
    expect(result).toContain("RECENT DECISIONS:");
    expect(result).toContain("Build temporary sheep shelter");
    expect(result).toContain("Saves $2,200 for barn fund");
    expect(result).toContain("follow-up: 2026-04-26");
  });

  it("renders decisions with outcomes", () => {
    const ctx = createEmptyContext();
    ctx.decisions = [{
      id: "dec-1",
      date: "2026-01-10",
      description: "Switch to animal-based diet",
      reasoning: "Better energy, cheaper than supplements",
      outcome: "Energy up, groceries down $80/month",
      outcomeDate: "2026-03-01",
    }];

    const result = contextForPrompt(ctx);
    expect(result).toContain("Outcome: Energy up, groceries down $80/month");
  });

  it("renders temporal items — upcoming and overdue", () => {
    const ctx = createEmptyContext();
    ctx.temporal.upcoming = [
      { what: "order pullets", when: "March 2026", source: "plan" },
    ];
    ctx.temporal.overdue = [
      { what: "soil test", when: "February 2026", source: "seasonal" },
    ];

    const result = contextForPrompt(ctx);
    expect(result).toContain("PLANNING:");
    expect(result).toContain("order pullets (March 2026)");
    expect(result).toContain("OVERDUE: soil test (was due February 2026)");
  });
});
