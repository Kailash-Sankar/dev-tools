import { describe, expect, it } from "vitest";

import { fromBase64, toBase64, uriDecode, uriEncode } from "./codec";

describe("toBase64 / fromBase64", () => {
  // The old implementation used btoa/atob directly, which throw
  // InvalidCharacterError on any code unit >= 256. These are the regressions
  // that motivated the TextEncoder-based implementation.
  it("round-trips ASCII", () => {
    expect(fromBase64(toBase64("hello world"))).toBe("hello world");
  });

  it("round-trips an empty string", () => {
    expect(toBase64("")).toBe("");
    expect(fromBase64("")).toBe("");
  });

  it("round-trips accented latin", () => {
    expect(fromBase64(toBase64("café"))).toBe("café");
  });

  it("round-trips CJK", () => {
    expect(fromBase64(toBase64("你好世界"))).toBe("你好世界");
  });

  it("round-trips emoji (4-byte code points)", () => {
    expect(fromBase64(toBase64("🎉🎊"))).toBe("🎉🎊");
  });

  it("round-trips a mixed payload", () => {
    const s = "Hello world! Café ☕ 你好 🎉 ".repeat(200);
    expect(fromBase64(toBase64(s))).toBe(s);
  });

  it("handles input large enough to exceed the btoa argument limit", () => {
    const s = "a".repeat(200_000);
    expect(fromBase64(toBase64(s))).toBe(s);
  });

  it("tolerates whitespace and newlines from wrapped base64", () => {
    expect(fromBase64("aGVsbG8g\nd29ybGQ=")).toBe("hello world");
  });

  it("rejects invalid base64 instead of returning garbage", () => {
    expect(() => fromBase64("not!valid")).toThrow(/not valid base64/i);
  });
});

describe("uriEncode / uriDecode", () => {
  it("round-trips reserved and unicode characters", () => {
    const s = "a b&c=d/e?f#g 你好 🎉";
    expect(uriDecode(uriEncode(s))).toBe(s);
  });

  it("encodes spaces and slashes", () => {
    expect(uriEncode("a b/c")).toBe("a%20b%2Fc");
  });

  it("decodes percent sequences", () => {
    expect(uriDecode("a%20b")).toBe("a b");
  });

  // decodeURIComponent throws URIError on a lone '%', which is easy to hit by
  // pasting a partial query string.
  it("does not throw on a lone percent sign", () => {
    expect(() => uriDecode("100% sure")).not.toThrow();
    expect(uriDecode("100% sure")).toBe("100% sure");
  });

  it("decodes the valid part around a malformed sequence", () => {
    expect(uriDecode("a%20b%zzc")).toContain("a b");
  });
});
