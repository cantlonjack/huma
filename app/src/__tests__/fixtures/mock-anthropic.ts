import { vi } from "vitest";

/** Anthropic SDK's APIUserAbortError shape; used by mock-stream's throwOnAbort. */
export class APIUserAbortError extends Error {
  constructor() {
    super("Stream aborted by user");
    this.name = "APIUserAbortError";
  }
}

export interface MockStreamOptions {
  text?: string;
  inputTokens?: number;
  outputTokens?: number;
  /** When true, calling stream.abort() during iteration throws APIUserAbortError. */
  throwOnAbort?: boolean;
  /** Delay (ms) between yielded characters; lets external abort() fire mid-stream. */
  chunkDelayMs?: number;
}

/** Build a mock MessageStream-shaped object. Reused by Plans 02 (quota), 03 (budget),
 *  05c (observability streaming), and 06 (abort wiring).
 */
export function makeMockStream(opts: MockStreamOptions = {}) {
  const text = opts.text ?? "ok";
  const inputTokens = opts.inputTokens ?? 100;
  const outputTokens = opts.outputTokens ?? 1;
  const delay = opts.chunkDelayMs ?? 0;

  let aborted = false;
  const abortFn = vi.fn(() => { aborted = true; });

  async function* iter() {
    for (const ch of text.split("")) {
      if (aborted) {
        if (opts.throwOnAbort) throw new APIUserAbortError();
        return;
      }
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));
      yield { type: "content_block_delta", delta: { type: "text_delta", text: ch } };
    }
  }

  const onListeners: Record<string, Array<(arg: unknown) => void>> = {};

  const stream = {
    abort: abortFn,
    [Symbol.asyncIterator]: () => iter(),
    finalMessage: async () => {
      if (aborted && opts.throwOnAbort) throw new APIUserAbortError();
      return { usage: { input_tokens: inputTokens, output_tokens: outputTokens } };
    },
    on: vi.fn((event: string, listener: (arg: unknown) => void) => {
      (onListeners[event] ??= []).push(listener);
      return stream;
    }),
    _emit: (event: string, arg: unknown) => {
      for (const l of onListeners[event] ?? []) l(arg);
    },
  };

  return { stream, abortFn, get aborted() { return aborted; }, APIUserAbortError };
}

/** Mock for anthropic.messages.countTokens. Pass a single number for fixed value, or an array
 *  to return successive values across multiple calls (last value sticks).
 */
export function mockAnthropicCountTokens(value: number | number[]) {
  const list = Array.isArray(value) ? [...value] : [value];
  return vi.fn(async () => ({ input_tokens: list.length > 1 ? list.shift()! : list[0] }));
}

/** Build a complete Anthropic class for vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic })). */
export function makeMockAnthropic(opts: MockStreamOptions = {}) {
  const { stream, abortFn } = makeMockStream(opts);
  const countTokens = mockAnthropicCountTokens(opts.inputTokens ?? 100);
  const create = vi.fn(async () => ({
    content: [{ type: "text", text: opts.text ?? "ok" }],
    usage: { input_tokens: opts.inputTokens ?? 100, output_tokens: opts.outputTokens ?? 1 },
  }));
  const streamFn = vi.fn((_body: unknown, _opts?: { signal?: AbortSignal }) => stream);
  return {
    MockAnthropic: class {
      messages = { stream: streamFn, countTokens, create };
    },
    stream,
    streamFn,
    abortFn,
    countTokens,
    create,
  };
}
