import { ulid } from "@/lib/ulid";
import { createAdminSupabase } from "@/lib/supabase-admin";

// ─── Types ───────────────────────────────────────────────────────────────

/**
 * Log source classification — keeps per-user dashboards clean when a request
 * has no resolved user (cron jobs, pre-flag-flip system requests).
 *
 * - "user": end-user request with a resolved user_id (authed or anon).
 * - "cron":  CRON_SECRET bearer — scheduled jobs.
 * - "system": pre-flag-flip shim (PHASE_1_GATE_ENABLED=false). NOT a user.
 */
export type LogSource = "user" | "cron" | "system";

/** Canonical 7-field log payload emitted on every request exit. */
export interface LogPayload {
  req_id: string;
  user_id: string | null;
  route: string;
  prompt_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: number;
  source: LogSource;
}

/** Handler-facing context — all setters mutate closure variables (no globalThis). */
export interface ObsCtx {
  reqId: string;
  userId: string | null;
  route: string;
  source: LogSource;
  setPromptTokens: (n: number) => void;
  setOutputTokens: (n: number) => void;
  setUserId: (id: string | null) => void;
}

type UserIdResolver = (
  request: Request,
) => Promise<string | null> | string | null;

// ─── Retry queue for cost_metrics_raw writes (Warning 4) ─────────────────

const QUEUE_CAP = 100;
let pendingPayloads: LogPayload[] = [];

/**
 * Drain the in-memory retry queue best-effort. Called from each request's
 * exit path. Failed drains re-enqueue with a cap.
 */
async function drainQueue(): Promise<void> {
  if (pendingPayloads.length === 0) return;
  const drained = pendingPayloads;
  pendingPayloads = [];
  for (const payload of drained) {
    try {
      await writeOnce(payload);
    } catch {
      // Failed again — re-enqueue with cap enforcement.
      if (pendingPayloads.length >= QUEUE_CAP) {
        pendingPayloads.shift();
        // eslint-disable-next-line no-console -- operator-visible error signal.
        console.error("[obs] cost_metrics_raw queue overflow — dropping oldest entry");
      }
      pendingPayloads.push(payload);
    }
  }
}

/**
 * Single insert attempt. Throws on error so callers can branch on
 * success/failure.
 */
async function writeOnce(payload: LogPayload): Promise<void> {
  const admin = createAdminSupabase();
  const { error } = await admin.from("cost_metrics_raw").insert({
    req_id: payload.req_id,
    user_id: payload.user_id,
    route: payload.route,
    prompt_tokens: payload.prompt_tokens,
    output_tokens: payload.output_tokens,
    latency_ms: payload.latency_ms,
    status: payload.status,
    source: payload.source,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

// ─── Public wrapper ──────────────────────────────────────────────────────

/**
 * Wrap a route handler with request-scoped observability.
 *
 * Emits a single JSON-serialized `LogPayload` to stdout on every request exit
 * (success or failure). Best-effort mirror write to `cost_metrics_raw` backs
 * the log with a queryable cost trail; failed writes join an in-memory retry
 * queue (cap {@link QUEUE_CAP}) drained on the next request.
 *
 * Design notes:
 * - **Warning 5:** `setPromptTokens` / `setOutputTokens` mutate closure
 *   variables — no `globalThis` cross-talk between concurrent requests.
 * - **Warning 4:** in-memory retry queue drains on next request's exit path.
 *   Queue overflow drops oldest + emits console.error.
 * - **Warning 2:** `source:'system'` is preserved when `userIdResolver`
 *   returns null (keeps per-user dashboards clean).
 *
 * Error semantics:
 * - Handler returns Response → status taken from response.status.
 * - Handler throws Response → returned to caller; status honored in log.
 * - Handler throws non-Response → status=500 logged; error re-thrown.
 */
export async function withObservability(
  request: Request,
  route: string,
  source: LogSource,
  userIdResolver: UserIdResolver,
  handler: (ctx: ObsCtx) => Promise<Response>,
): Promise<Response> {
  const reqId = ulid();
  const t0 = Date.now();

  // Closure state — mutable from handler setters (Warning 5: no globalThis).
  let userId: string | null = null;
  let promptTokens = 0;
  let outputTokens = 0;
  let status = 500;

  // Resolve user_id up-front. Resolver errors → null (don't block observability).
  try {
    userId = await Promise.resolve(userIdResolver(request));
  } catch {
    userId = null;
  }

  const ctx: ObsCtx = {
    reqId,
    userId,
    route,
    source,
    setPromptTokens: (n) => {
      promptTokens = n;
    },
    setOutputTokens: (n) => {
      outputTokens = n;
    },
    setUserId: (id) => {
      userId = id;
    },
  };

  let response: Response | null = null;
  let thrown: unknown = undefined;

  try {
    response = await handler(ctx);
    status = response.status;
  } catch (err) {
    thrown = err;
    if (err instanceof Response) {
      status = err.status;
      response = err;
    } else {
      status = 500;
    }
  } finally {
    const payload: LogPayload = {
      req_id: reqId,
      user_id: userId,
      route,
      prompt_tokens: promptTokens,
      output_tokens: outputTokens,
      latency_ms: Date.now() - t0,
      status,
      source,
    };
    // eslint-disable-next-line no-console -- Vercel stdout JSON ingestion.
    console.log(JSON.stringify(payload));

    // Best-effort raw insert + queue retry (Warning 4). Skip 5xx and
    // zero-token short-circuits (except 200) to keep write volume bounded.
    if (status < 500 && (promptTokens > 0 || outputTokens > 0 || status === 200)) {
      void (async () => {
        await drainQueue();
        try {
          await writeOnce(payload);
        } catch {
          if (pendingPayloads.length >= QUEUE_CAP) {
            pendingPayloads.shift();
            // eslint-disable-next-line no-console -- operator-visible.
            console.error("[obs] cost_metrics_raw queue overflow — dropping oldest");
          }
          pendingPayloads.push(payload);
        }
      })();
    }
  }

  if (thrown !== undefined && !(thrown instanceof Response)) throw thrown;
  // At this point response is guaranteed non-null: either the handler
  // returned one, or it threw a Response (captured above), or it threw a
  // non-Response (re-thrown on the line above — we never reach here).
  return response!;
}

/**
 * Test-only helper to reset the in-memory retry queue between tests.
 * NOT exported from the module's public surface — callers must import by name.
 */
export function __resetObsQueueForTests(): void {
  pendingPayloads = [];
}
