/**
 * SEC-04 (Plan 01-04): Prompt-injection sanitizer.
 *
 * `sanitizeUserText(raw)` applies four transforms at the request input boundary:
 *   1. NFC-normalize (composed / decomposed forms collapse to a single canonical form)
 *   2. Strip zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
 *   3. Strip leading "ignore previous instructions" style injection prefixes SILENTLY
 *      (applied iteratively so stacked prefixes all peel off)
 *   4. Reject `[[` or `]]` marker delimiters — these would spoof HUMA's marker protocol
 *      (`[[MARKER:...]]`). Detected AFTER stripping so a prefix of `[[` is still caught.
 *
 * Marker rejection returns `{ rejected: 'markers' }`; injection-phrase stripping is silent.
 * Per CONTEXT.md: only `[[`/`]]` trigger a hard 400. Injection prefixes are silently cleaned
 * so legitimate users who happen to write "Ignore previous instructions…" in a diary entry
 * aren't turned away — we strip the suspicious lead-in and accept the rest.
 *
 * `userTextField(opts)` is a preconfigured Zod `z.string().transform()` that surfaces
 * marker rejection as a Zod custom issue — `parseBody()` in parse.ts then converts that
 * issue into a 400 response via `badRequest()`.
 */

import { z } from "zod";

const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\uFEFF]/g;
const MARKER_RE = /\[\[|\]\]/;

// Injection-phrase patterns. Each is anchored to the START (^) + optional whitespace so
// only leading injection attempts are stripped — the same phrase appearing mid-sentence
// is left alone because it may be legitimate narrative.
const INJECTION_PREFIX_RES: RegExp[] = [
  /^\s*ignore\s+(all\s+)?previous\s+instructions[,\s:.;-]*/i,
  /^\s*disregard\s+(all\s+)?previous[,\s:.;-]*/i,
  /^\s*system\s*:\s*/i,
];

export interface SanitizeResult {
  /** Cleaned (or untouched) value. Always returned so callers can echo back on failure. */
  value: string;
  /** Set to 'markers' if `[[` or `]]` survived cleaning; otherwise undefined. */
  rejected?: "markers";
}

export function sanitizeUserText(raw: string): SanitizeResult {
  // 1. NFC normalize — collapse decomposed forms so later regexes match consistently.
  let value = raw.normalize("NFC");

  // 2. Strip zero-width characters — these are invisible and commonly used to smuggle
  //    marker delimiters past naive text matchers (e.g. `[\u200B[MARKER]\u200B]`).
  value = value.replace(ZERO_WIDTH_RE, "");

  // 3. Iteratively strip leading injection phrases. Multiple stacked prefixes are peeled
  //    one-by-one; the loop bound (10) is defensive — real inputs will break out in 0-2.
  for (let i = 0; i < 10; i++) {
    let stripped = false;
    for (const re of INJECTION_PREFIX_RES) {
      const next = value.replace(re, "");
      if (next !== value) {
        value = next.trimStart();
        stripped = true;
        break;
      }
    }
    if (!stripped) break;
  }

  // 4. Reject marker delimiters. Checked LAST so that e.g. "ignore previous [[…]]" still
  //    has the prefix stripped before we notice the markers — the markers remain the
  //    reason the request is rejected.
  if (MARKER_RE.test(value)) {
    return { value, rejected: "markers" };
  }

  return { value };
}

/**
 * Preconfigured Zod string field for user-written text. Replaces bare `z.string().min().max()`
 * wherever a user provides free-form input. On marker rejection, adds a Zod custom issue which
 * `parseBody()` converts into a 400 response with message "…reserved marker delimiters…".
 *
 * The resulting field value is the sanitized string (zero-width stripped, injection prefix
 * peeled, NFC-normalized) — downstream consumers receive cleaned text.
 */
export function userTextField(opts: { min?: number; max?: number } = {}) {
  const min = opts.min ?? 0;
  const max = opts.max ?? 50_000;
  return z
    .string()
    .min(min)
    .max(max)
    .transform((val, ctx) => {
      const r = sanitizeUserText(val);
      if (r.rejected === "markers") {
        ctx.addIssue({
          code: "custom",
          message:
            "Input contains reserved marker delimiters ([[ or ]]). Please remove them and try again.",
        });
        return z.NEVER;
      }
      return r.value;
    });
}
