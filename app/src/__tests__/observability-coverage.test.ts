import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";

// ─── SEC-05 observability coverage meta-test (Plan 01-05b) ─────────────────
// Scans every route under app/src/app/api/**/route.ts(x) and enforces that:
//
//   - any route importing @anthropic-ai/sdk directly, OR
//   - any route in INDIRECT_ALLOWLIST (cron/fan-out routes that call
//     Anthropic via fetch to internal routes — no SDK import to grep),
//
// MUST also import withObservability (or reference the symbol in source).
// Hard-fails with the offending file paths when an addition slips through
// without the wrap. This closes Blocker 4 from the plan:
//
//   "morning-sheet does NOT import @anthropic-ai/sdk directly (it fetches
//    /api/sheet + /api/insight), so an SDK-grep alone would miss it. The
//    allowlist forces the wrap."
//
// When adding a new indirect Anthropic caller (new cron that fans out to
// other LLM routes), add its directory segment to INDIRECT_ALLOWLIST here.

const API_DIR = resolve(__dirname, "..", "app", "api");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (entry === "route.ts" || entry === "route.tsx") out.push(full);
  }
  return out;
}

/**
 * Indirect-allowlist: route files that call Anthropic via fetch to another
 * internal route (not via the SDK directly). The SDK-import grep would miss
 * them, so list the path segment here and the meta-test hard-fails if any
 * of them drops the withObservability wrap.
 *
 * Segments are matched against the path components of the route file so a
 * substring like "morning-sheet" in some unrelated file name cannot accidentally
 * silence the check.
 */
const INDIRECT_ALLOWLIST = new Set<string>([
  // Plan 05c wraps morning-sheet (fetches /api/sheet + /api/insight). Listed
  // here so Wave 2 completion requires BOTH 05b and 05c to be green — if 05c
  // later removes the wrap, this meta-test catches it.
  "morning-sheet",
]);

function pathSegments(absPath: string): string[] {
  return absPath.split(sep).filter(Boolean);
}

function isIndirectAllowlisted(routeFile: string): boolean {
  const segs = pathSegments(routeFile);
  for (const seg of segs) {
    if (INDIRECT_ALLOWLIST.has(seg)) return true;
  }
  return false;
}

function importsAnthropicSdk(src: string): boolean {
  return (
    /from\s+["']@anthropic-ai\/sdk["']/.test(src) ||
    /require\(\s*["']@anthropic-ai\/sdk["']\s*\)/.test(src)
  );
}

function hasObservabilityWrap(src: string): boolean {
  return (
    /from\s+["']@\/lib\/observability["']/.test(src) ||
    /require\(\s*["']@\/lib\/observability["']\s*\)/.test(src) ||
    /withObservability\s*\(/.test(src)
  );
}

describe("SEC-05 observability coverage", () => {
  it("every route importing @anthropic-ai/sdk OR in INDIRECT_ALLOWLIST imports withObservability", () => {
    const routeFiles = walk(API_DIR);
    // Sanity: we expect to find several route.ts files — if zero, the walk
    // itself is broken and the test would silently pass.
    expect(routeFiles.length).toBeGreaterThan(3);

    const offenders: string[] = [];
    for (const f of routeFiles) {
      const src = readFileSync(f, "utf8");
      const usesAnthropic = importsAnthropicSdk(src);
      const isAllowlisted = isIndirectAllowlisted(f);
      if (!usesAnthropic && !isAllowlisted) continue;
      if (!hasObservabilityWrap(src)) offenders.push(f);
    }

    expect(
      offenders,
      `Routes that import @anthropic-ai/sdk or are in INDIRECT_ALLOWLIST must wrap in withObservability:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
