import { describe, it, expect } from "vitest";
import { ulid, isULID, monotonicUlid } from "./ulid";

describe("ulid", () => {
  it("ulid() returns a 26-char Crockford base32 string matching the ULID shape", () => {
    const id = ulid();
    expect(typeof id).toBe("string");
    expect(id).toHaveLength(26);
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it("isULID() returns true for valid ULIDs and false for malformed input", () => {
    expect(isULID(ulid())).toBe(true);
    expect(isULID(monotonicUlid())).toBe(true);
    expect(isULID("not-a-ulid")).toBe(false);
    expect(isULID("")).toBe(false);
    expect(isULID(null)).toBe(false);
    expect(isULID(undefined)).toBe(false);
    expect(isULID(12345)).toBe(false);
    // Lowercase should fail — Crockford base32 is uppercase-only for the
    // permitted alphabet.
    expect(isULID("01hxq0cxb9x4y1fzrvprpvj3b7")).toBe(false);
    // I, L, O, U are not part of Crockford base32.
    expect(isULID("I".repeat(26))).toBe(false);
  });

  it("monotonicUlid() produces strictly non-decreasing ids when called in quick succession", () => {
    const ids = Array.from({ length: 10 }, () => monotonicUlid());
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i].localeCompare(ids[i - 1])).toBeGreaterThanOrEqual(0);
    }
    // All unique within a tight loop (monotonic factory guarantees this).
    expect(new Set(ids).size).toBe(ids.length);
  });
});
