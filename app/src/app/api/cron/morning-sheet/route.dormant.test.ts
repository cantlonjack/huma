import { describe, it } from "vitest";

describe("REGEN-02: morning-sheet cron skips dormant users", () => {
  it.skip("user with huma_context.dormant.active:true is skipped before sheet compile", () => {
    // Plan 02-02 fills this
  });

  it.skip("skip emits structured log with source:'cron' + skip_reason:'dormant'", () => {
    // Plan 02-02 fills this
  });

  it.skip("skip increments totalSkipped counter (separately from other skip reasons)", () => {
    // Plan 02-02 fills this
  });

  it.skip("no push.send() call for dormant user", () => {
    // Plan 02-02 fills this
  });

  it.skip("no Anthropic call (sheet compile) for dormant user — quota/budget preserved", () => {
    // Plan 02-02 fills this
  });

  it.skip("non-dormant users in same cron run are still processed normally", () => {
    // Plan 02-02 fills this
  });
});
