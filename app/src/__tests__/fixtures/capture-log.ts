import { vi, type MockInstance } from "vitest";

export interface CapturedLog {
  req_id?: string;
  user_id?: string | null;
  route?: string;
  prompt_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
  status?: number;
  source?: "user" | "cron" | "system";
  [k: string]: unknown;
}

/**
 * Spy on console.log; parse each call's first arg as JSON and collect.
 * Non-JSON logs are ignored. Always pair with `restore()` in afterEach.
 */
export function captureConsoleLog(): {
  logs: CapturedLog[];
  restore: () => void;
  spy: MockInstance;
} {
  const logs: CapturedLog[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    for (const a of args) {
      if (typeof a === "string") {
        try { logs.push(JSON.parse(a)); } catch { /* non-JSON — skip */ }
      }
    }
  });
  return { logs, restore: () => spy.mockRestore(), spy };
}
