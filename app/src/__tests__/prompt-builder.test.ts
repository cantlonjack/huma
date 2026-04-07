import { describe, it, expect } from "vitest";
import { detectMode } from "@/lib/services/prompt-builder";

describe("detectMode", () => {
  it("returns focus for 'I want to eat better'", () => {
    const result = detectMode(["I want to eat better"], undefined, []);
    expect(result).toBe("focus");
  });

  it("returns decision for 'Should I buy a shelter?'", () => {
    const result = detectMode(["Should I buy a shelter?"], undefined, []);
    expect(result).toBe("decision");
  });

  it("returns open for 'How's it going'", () => {
    const result = detectMode(["How's it going"], undefined, []);
    expect(result).toBe("open");
  });

  it("respects chatMode override — new-aspiration → focus", () => {
    const result = detectMode(["just chatting"], "new-aspiration", []);
    expect(result).toBe("focus");
  });

  it("respects chatMode override — decision", () => {
    const result = detectMode(["just chatting"], "decision", []);
    expect(result).toBe("decision");
  });

  it("decision signals win over aspiration signals", () => {
    // "I want to decide" has both "i want to" (focus) and "decide" isn't a signal,
    // but "should i" is a decision signal — test with explicit conflict
    const result = detectMode(["I'm trying to decide if I should sell"], undefined, []);
    expect(result).toBe("decision");
  });

  it("uses last 3 messages for detection", () => {
    const messages = [
      "Hello",
      "My name is Jack",
      "I'm considering buying a new truck",
    ];
    const result = detectMode(messages, undefined, []);
    expect(result).toBe("decision");
  });

  it("returns open for general conversation", () => {
    const messages = [
      "Hey there",
      "Just moved to a new place",
      "It's pretty nice here",
    ];
    const result = detectMode(messages, undefined, []);
    expect(result).toBe("open");
  });

  it("detects focus from 'let's plan'", () => {
    const result = detectMode(["Let's plan my garden"], undefined, []);
    expect(result).toBe("focus");
  });

  it("detects decision from 'is it worth'", () => {
    const result = detectMode(["Is it worth getting chickens?"], undefined, []);
    expect(result).toBe("decision");
  });

  it("returns open for empty conversation", () => {
    const result = detectMode([], undefined, []);
    expect(result).toBe("open");
  });
});
