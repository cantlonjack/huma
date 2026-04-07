import { describe, it, expect } from "vitest";
import { mergeContext, contextForPrompt } from "@/lib/context-model";
import { createEmptyContext } from "@/types/context";

describe("conversation → context flow integration", () => {
  it("merges extracted context and renders it in the next prompt", () => {
    // Simulate: Claude returns [[CONTEXT:{"body":{"sleep":"6 hours"}}]]
    const existing = createEmptyContext();
    const extracted = { body: { sleep: "6 hours" } };

    const merged = mergeContext(existing, extracted, "conversation", "msg-abc");

    // Assert merge produced correct HumaContext
    expect(merged.body.sleep).toBe("6 hours");
    expect(merged._sources.length).toBeGreaterThan(0);

    // Assert next call to contextForPrompt includes the new data
    const prose = contextForPrompt(merged);
    expect(prose).toContain("Sleep: 6 hours");
  });

  it("accumulates context across multiple conversation turns", () => {
    let ctx = createEmptyContext();

    // Turn 1: user says "I live in rural Michigan"
    ctx = mergeContext(ctx, { home: { location: "rural Michigan" } }, "conversation");
    expect(ctx.home.location).toBe("rural Michigan");

    // Turn 2: user says "my wife Sarah works nights"
    ctx = mergeContext(ctx, {
      people: { household: [{ name: "Sarah", relationship: "wife", detail: "works nights" }] },
    }, "conversation");

    // Turn 3: user says "we have about $85k combined income"
    ctx = mergeContext(ctx, { money: { income: "$85k combined" } }, "conversation");

    // Verify accumulated state
    const prose = contextForPrompt(ctx);
    expect(prose).toContain("rural Michigan");
    expect(prose).toContain("Sarah (wife)");
    expect(prose).toContain("works nights");
    expect(prose).toContain("$85k combined");
  });

  it("handles decision extraction and follow-up rendering", () => {
    let ctx = createEmptyContext();

    // Context building
    ctx = mergeContext(ctx, {
      home: { location: "rural Michigan", land: "2 acres" },
      money: { income: "$85k combined" },
    }, "conversation");

    // Decision made
    ctx = {
      ...ctx,
      decisions: [{
        id: "dec-1",
        date: "2026-03-15",
        description: "Build temporary sheep shelter",
        reasoning: "Saves $2,200 for barn fund. Gets through winter.",
        frameworksSurfaced: ["weak_link", "marginal_reaction"],
        followUpDue: "2026-04-26",
      }],
    };

    const prose = contextForPrompt(ctx);
    expect(prose).toContain("Build temporary sheep shelter");
    expect(prose).toContain("Saves $2,200 for barn fund");
    expect(prose).toContain("follow-up: 2026-04-26");
  });

  it("merging does not lose existing dimensions when adding new ones", () => {
    let ctx = createEmptyContext();
    ctx = mergeContext(ctx, { body: { sleep: "7 hours" } }, "conversation");
    ctx = mergeContext(ctx, { home: { location: "Portland" } }, "conversation");
    ctx = mergeContext(ctx, { money: { income: "$60k" } }, "conversation");

    expect(ctx.body.sleep).toBe("7 hours");
    expect(ctx.home.location).toBe("Portland");
    expect(ctx.money.income).toBe("$60k");
  });
});
