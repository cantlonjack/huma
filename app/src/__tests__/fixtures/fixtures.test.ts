import { describe, it, expect } from "vitest";
import { mockSupabaseNoSession, mockSupabaseAnonSession, mockSupabaseAuthedSession } from "./mock-supabase";
import { makeMockStream, makeMockAnthropic, mockAnthropicCountTokens, APIUserAbortError } from "./mock-anthropic";
import { captureConsoleLog } from "./capture-log";

describe("Phase 1 fixtures", () => {
  it("mockSupabaseNoSession returns a client with auth.getUser → null user", async () => {
    const c = mockSupabaseNoSession();
    const { data } = await c.auth.getUser();
    expect(data.user).toBeNull();
  });

  it("mockSupabaseAnonSession returns is_anonymous: true", async () => {
    const c = mockSupabaseAnonSession("anon-1");
    const { data } = await c.auth.getUser();
    expect(data.user?.id).toBe("anon-1");
    expect(data.user?.is_anonymous).toBe(true);
  });

  it("mockSupabaseAuthedSession with tier:operate exposes a subscription row", async () => {
    const c = mockSupabaseAuthedSession("u-1", { tier: "operate" });
    const sub = await c.from("subscriptions").select().eq("a", "b").maybeSingle();
    expect(sub.data).toEqual({ tier: "operate", status: "active" });
  });

  it("makeMockStream iterator yields characters and supports abort()", async () => {
    const { stream, abortFn } = makeMockStream({ text: "ab" });
    const events: unknown[] = [];
    for await (const e of stream) events.push(e);
    expect(events).toHaveLength(2);
    stream.abort();
    expect(abortFn).toHaveBeenCalled();
  });

  it("makeMockStream({throwOnAbort:true}) throws APIUserAbortError when aborted mid-stream", async () => {
    const { stream } = makeMockStream({ text: "abcdefgh", throwOnAbort: true, chunkDelayMs: 1 });
    const consume = (async () => {
      try { for await (const _ of stream) { stream.abort(); } return null; }
      catch (e) { return e; }
    })();
    const err = await consume;
    expect((err as Error)?.name).toBe("APIUserAbortError");
  });

  it("makeMockStream.finalMessage returns usage object", async () => {
    const { stream } = makeMockStream({ inputTokens: 42, outputTokens: 7 });
    const final = await stream.finalMessage();
    expect(final.usage.input_tokens).toBe(42);
    expect(final.usage.output_tokens).toBe(7);
  });

  it("mockAnthropicCountTokens returns successive values", async () => {
    const ct = mockAnthropicCountTokens([10, 20, 30]);
    expect((await ct()).input_tokens).toBe(10);
    expect((await ct()).input_tokens).toBe(20);
    expect((await ct()).input_tokens).toBe(30);
    // Sticky on last:
    expect((await ct()).input_tokens).toBe(30);
  });

  it("makeMockAnthropic exposes class with messages.{stream, countTokens, create}", () => {
    const { MockAnthropic } = makeMockAnthropic();
    const a = new MockAnthropic();
    expect(typeof a.messages.stream).toBe("function");
    expect(typeof a.messages.countTokens).toBe("function");
    expect(typeof a.messages.create).toBe("function");
  });

  it("captureConsoleLog collects JSON.stringify(payload) calls", () => {
    const cap = captureConsoleLog();
    console.log(JSON.stringify({ req_id: "r1", route: "/x" }));
    console.log("not json — ignored");
    console.log(JSON.stringify({ status: 200 }));
    expect(cap.logs).toHaveLength(2);
    expect(cap.logs[0].req_id).toBe("r1");
    expect(cap.logs[1].status).toBe(200);
    cap.restore();
  });

  it("APIUserAbortError carries the canonical name", () => {
    expect(new APIUserAbortError().name).toBe("APIUserAbortError");
  });
});
