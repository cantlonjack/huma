import { ulid as rawUlid, monotonicFactory } from "ulid";

/**
 * Generate a fresh ULID.
 *
 * ULIDs are 26-char Crockford base32 strings (lexicographically sortable
 * timestamp + randomness). Used as request correlation ids in observability
 * logs, cost_metrics_raw rows, and debug traces.
 */
export const ulid = (): string => rawUlid();

/**
 * Monotonic ULID factory — guarantees strictly non-decreasing ids when called
 * in the same millisecond. Useful when generating many ids in a tight loop and
 * downstream consumers depend on lexicographic ordering (e.g. deduping /
 * ordered inserts).
 */
export const monotonicUlid = monotonicFactory();

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/** Type-guard for ULID-shaped strings (Crockford base32, 26 chars). */
export function isULID(s: unknown): s is string {
  return typeof s === "string" && ULID_RE.test(s);
}
