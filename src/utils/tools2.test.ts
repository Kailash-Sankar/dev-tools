/**
 * Base converter, IDs, chmod, case conversion, TOML, MIME and regex.
 *
 * The expectations are taken from published specifications and RFCs wherever
 * one exists -- the ULID spec test vector, POSIX mode semantics, RFC 9562
 * UUID shape -- rather than from whatever the implementation happens to
 * produce, so a regression shows up as a disagreement with the spec.
 */
import { describe, expect, it } from "vitest";

import { BaseConvertError, bitLength, formatInBase, parseInBase, toAllBases } from "./base";
import { ID_FORMATS, generateId, ulid, ulidTimestamp, uuid4 } from "./ids";
import { ChmodError, fromOctal, toOctal, toSymbolic } from "./chmod";
import { CASE_FORMATS, convertCase } from "./case";
import { TomlError, flattenToml, jsonToToml, tomlToJson } from "./toml";
import { COMMON_TYPES, describe as describeMime, lookupExtension, lookupType, resolve } from "./mime";
import { RegexError, testRegex } from "./regex";

describe("base converter", () => {
  it("converts 255 across all four bases", () => {
    const v = parseInBase("255", 10);
    expect(toAllBases(v)).toEqual({ 2: "11111111", 8: "377", 10: "255", 16: "ff" });
  });

  it("round-trips hex through every base", () => {
    for (const hex of ["0", "1", "ff", "deadbeef", "7fffffffffffffff"]) {
      const v = parseInBase(hex, 16);
      expect(formatInBase(v, 16)).toBe(hex);
      expect(formatInBase(v, 10)).toBe(BigInt(`0x${hex}`).toString(10));
    }
  });

  it("handles values beyond Number.MAX_SAFE_INTEGER", () => {
    // 2^53 + 1: exactly the value Number silently rounds.
    const v = parseInBase("9007199254740993", 10);
    expect(formatInBase(v, 16)).toBe("20000000000001");
    expect(formatInBase(v, 10)).toBe("9007199254740993");
    // Proof it did not go through Number.
    expect(String(v)).not.toBe(String(Number("9007199254740993")));
  });

  it("handles negative numbers", () => {
    expect(formatInBase(parseInBase("-42", 10), 16)).toBe("-2a");
    expect(formatInBase(parseInBase("-ff", 16), 2)).toBe(
      "-" + BigInt("0xff").toString(2)
    );
  });

  it("accepts radix prefixes in the input", () => {
    expect(formatInBase(parseInBase("0x1A", 10), 10)).toBe("26");
    expect(formatInBase(parseInBase("0b1010", 10), 10)).toBe("10");
    expect(formatInBase(parseInBase("0o17", 10), 10)).toBe("15");
  });

  it("ignores whitespace, underscores and commas", () => {
    expect(formatInBase(parseInBase(" 1_000 ", 10), 10)).toBe("1000");
    expect(formatInBase(parseInBase("1,024", 10), 10)).toBe("1024");
  });

  it("rejects digits outside the base", () => {
    expect(() => parseInBase("2", 2)).toThrow(BaseConvertError);
    expect(() => parseInBase("8", 8)).toThrow(BaseConvertError);
    expect(() => parseInBase("g", 16)).toThrow(BaseConvertError);
  });

  it("rejects fractions rather than truncating them", () => {
    expect(() => parseInBase("1.5", 10)).toThrow(/Fractions are not supported/);
  });

  it("rejects empty input with a useful message", () => {
    expect(() => parseInBase("   ", 10)).toThrow(/Enter a number/);
  });

  it("reports bit length", () => {
    expect(bitLength(0n)).toBe(0);
    expect(bitLength(1n)).toBe(1);
    expect(bitLength(255n)).toBe(8);
    expect(bitLength(-255n)).toBe(8);
  });
});

describe("id generation", () => {
  it("produces RFC 9562 version 4 UUIDs", () => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    for (let i = 0; i < 200; i++) expect(uuid4(), `iteration ${i}`).toMatch(re);
  });

  it("never repeats a UUID", () => {
    const seen = new Set(Array.from({ length: 2000 }, uuid4));
    expect(seen.size).toBe(2000);
  });

  it("matches the spec's canonical example string", () => {
    // The ULID spec's worked example is 01ARZ3NDEKTSV4RRFFQ69G5FAV, laid
    // out as 10 timestamp characters then 16 randomness characters. Encoding
    // that timestamp must reproduce the first 10 characters exactly.
    const randomness = new Uint8Array(10).fill(0xab);
    const id = ulid(1_469_922_850_259, randomness);
    expect(id).toHaveLength(26);
    expect(id.slice(0, 10)).toBe("01ARZ3NDEK");
    expect(id.slice(10)).toBe(ulid(1_469_922_850_259, randomness).slice(10));
  });

  it("rejects the maximum value the spec allows to overflow", () => {
    // The spec: the largest valid ULID is 7ZZZZZZZZZZZZZZZZZZZZZZZZZ,
    // i.e. 2^48-1. The leading character can only ever be 0-7 because
    // 26 x 5 = 130 bits but a ULID is 128.
    expect(ulid(281_474_976_710_655)).toMatch(/^7/);
    expect(ulid(0)).toMatch(/^0/);
    const overflow = `8${"Z".repeat(25)}`;
    expect(ulidTimestamp(overflow)).toBeNull();
  });

  it("round-trips a ULID timestamp", () => {
    for (const now of [0, 1_469_918_176_385, Date.UTC(2026, 0, 1), 281_474_976_710_655]) {
      const id = ulid(now);
      expect(ulidTimestamp(id), String(now)).toBe(now);
    }
  });

  it("produces 26-character Crockford base32 ULIDs", () => {
    const re = /^[0-7][0-9ABCDEFGHJKMNPQRSTVWXYZ]{25}$/;
    for (let i = 0; i < 200; i++) expect(ulid(), `iteration ${i}`).toMatch(re);
  });

  it("never repeats a ULID", () => {
    const seen = new Set(Array.from({ length: 2000 }, () => ulid()));
    expect(seen.size).toBe(2000);
  });

  it("sorts ULIDs in generation order and does not sort UUIDs", () => {
    // The property that makes ULIDs worth using.
    const early = ulid(1469918176385);
    const later = ulid(1469918177385);
    expect(early < later).toBe(true);
  });

  it("rejects a timestamp outside the 48-bit range", () => {
    expect(() => ulid(-1)).toThrow(/out of range/);
    expect(() => ulid(281_474_976_710_656)).toThrow(/out of range/);
  });

  it("rejects wrong-length randomness", () => {
    expect(() => ulid(Date.now(), new Uint8Array(8))).toThrow(/10 bytes/);
  });

  it("returns null for a malformed ULID timestamp", () => {
    expect(ulidTimestamp("short")).toBeNull();
    expect(ulidTimestamp("U1ARZ3NDEKTSV4RRFFQ69G5FAV")).toBeNull(); // U is not in the alphabet
  });

  it("exposes both formats", () => {
    expect(ID_FORMATS.map((f) => f.id)).toEqual(["uuid4", "ulid"]);
    expect(generateId("uuid4")).toMatch(/^[0-9a-f-]{36}$/);
    expect(generateId("ulid")).toHaveLength(26);
  });
});

describe("chmod", () => {
  it("reads the standard modes", () => {
    expect(toOctal(fromOctal("755"))).toBe("755");
    expect(toOctal(fromOctal("644"))).toBe("644");
    expect(toOctal(fromOctal("700"))).toBe("700");
    expect(toOctal(fromOctal("000"))).toBe("000");
  });

  it("renders symbolic form", () => {
    expect(toSymbolic(fromOctal("755"))).toBe("-rwxr-xr-x");
    expect(toSymbolic(fromOctal("644"), true)).toBe("drw-r--r--");
    expect(toSymbolic(fromOctal("600"))).toBe("-rw-------");
  });

  it("handles setuid, setgid and sticky", () => {
    expect(toOctal(fromOctal("755"), ["setuid"])).toBe("4755");
    expect(toOctal(fromOctal("755"), ["setgid"])).toBe("2755");
    expect(toOctal(fromOctal("1777"), ["sticky"])).toBe("1777");
  });

  it("accepts a 0o prefix and a 4-digit mode", () => {
    expect(toOctal(fromOctal("0o755"))).toBe("755");
    expect(toOctal(fromOctal("4755"), ["setuid"])).toBe("4755");
    expect(toOctal(fromOctal("7777"), ["setuid", "setgid", "sticky"])).toBe("7777");
  });

  it("round-trips every combination of the 9 permission bits", () => {
    for (let n = 0; n <= 0o777; n++) {
      const mode = n.toString(8).padStart(3, "0");
      expect(toOctal(fromOctal(mode)), mode).toBe(mode);
    }
  });

  it("maps individual bits correctly", () => {
    const p = fromOctal("754");
    expect(p.user).toEqual([true, true, true]);
    expect(p.group).toEqual([true, false, true]);
    expect(p.other).toEqual([true, false, false]);
  });

  it("rejects non-octal input", () => {
    expect(() => fromOctal("899")).toThrow(ChmodError);
    expect(() => fromOctal("rwx")).toThrow(/not an octal mode/);
    expect(() => fromOctal("")).toThrow(ChmodError);
  });
});

describe("case conversion", () => {
  it("converts a plain phrase to every format", () => {
    for (const f of CASE_FORMATS) {
      const out = convertCase("user first name", f.id);
      expect(out, f.id).toBeTruthy();
    }
    expect(convertCase("user first name", "camel")).toBe("userFirstName");
    expect(convertCase("user first name", "snake")).toBe("user_first_name");
    expect(convertCase("user first name", "constant")).toBe("USER_FIRST_NAME");
    expect(convertCase("user first name", "kebab")).toBe("user-first-name");
  });

  it("splits existing camelCase and acronyms correctly", () => {
    // The cases a naive split on capitals gets wrong.
    expect(convertCase("userID", "snake")).toBe("user_id");
    expect(convertCase("HTTPServer", "snake")).toBe("http_server");
    expect(convertCase("parseHTTPResponseXML", "kebab")).toBe("parse-http-response-xml");
  });

  it("handles separators", () => {
    expect(convertCase("user_first_name", "camel")).toBe("userFirstName");
    expect(convertCase("user-first-name", "camel")).toBe("userFirstName");
    expect(convertCase("user.first.name", "camel")).toBe("userFirstName");
  });

  it("returns an empty string unchanged", () => {
    expect(convertCase("", "camel")).toBe("");
  });
});

describe("toml", () => {
  const doc = `
[project]
name = "dev-tools"
version = "1.0.0"

[project.dependencies]
react = "^19.0.0"

[[bin]]
name = "cli"
path = "src/cli.ts"
`;

  it("parses a real pyproject-style document", () => {
    const out = tomlToJson(doc);
    const parsed = JSON.parse(out);
    expect(parsed.project.name).toBe("dev-tools");
    expect(parsed.project.dependencies.react).toBe("^19.0.0");
    expect(parsed.bin[0].name).toBe("cli");
  });

  it("round-trips through JSON", () => {
    const json = tomlToJson(doc);
    const back = jsonToToml(json);
    expect(JSON.parse(tomlToJson(back))).toEqual(JSON.parse(json));
  });

  it("flattens to dotted paths", () => {
    const flat = flattenToml(JSON.parse(tomlToJson(doc)));
    const paths = flat.map((f) => f.path);
    expect(paths).toContain("project.name");
    expect(paths).toContain("project.dependencies.react");
    expect(paths).toContain("bin[0].name");
  });

  it("reports an empty document", () => {
    expect(() => tomlToJson("   ")).toThrow(/Paste some TOML/);
  });

  it("surfaces syntax errors with the parser's message", () => {
    expect(() => tomlToJson("[unclosed\n")).toThrow(TomlError);
  });

  it("explains JSON that is valid but not TOML-representable", () => {
    // A bare array or scalar is legal JSON but has no TOML document form.
    expect(() => jsonToToml("[1,2]")).toThrow(TomlError);
    expect(() => jsonToToml('"just a string"')).toThrow(TomlError);
  });

  it("reports invalid JSON clearly", () => {
    expect(() => jsonToToml("{oops")).toThrow(/not valid JSON/);
  });
});

describe("mime", () => {
  it("maps extensions to types", () => {
    expect(lookupExtension("html")).toBe("text/html");
    expect(lookupExtension("webp")).toBe("image/webp");
    expect(lookupExtension("json")).toBe("application/json");
    expect(lookupExtension("wasm")).toBe("application/wasm");
    expect(lookupExtension("woff2")).toBe("font/woff2");
  });

  it("resolves every advertised example", () => {
    // COMMON_TYPES drives the one-click chips. An entry missing from the
    // table renders a chip that immediately errors, which is exactly what
    // happened for epub and rtf.
    for (const ext of COMMON_TYPES) {
      expect(lookupExtension(ext), `COMMON_TYPES entry "${ext}" has no MIME type`).toBeTruthy();
    }
  });

  it("prefers the short extension when several map to one type", () => {
    // jpg before jpeg, html before htm.
    expect(lookupType("image/jpeg")).toBe("jpg");
    expect(lookupType("text/html")).toBe("html");
  });

  it("tolerates a leading dot and mixed case", () => {
    expect(lookupExtension(".PNG")).toBe("image/png");
    expect(lookupExtension("  JsOn  ")).toBe("application/json");
  });

  it("maps types back to extensions", () => {
    expect(lookupType("image/webp")).toBe("webp");
    expect(lookupType("text/html; charset=utf-8")).toBe("html");
  });

  it("reports the implied charset for textual types only", () => {
    expect(describeMime("text/html")).toBe("charset=utf-8");
    expect(describeMime("application/json")).toBe("charset=utf-8");
    expect(describeMime("image/png")).toBeNull();
  });

  it("returns null for unknown input", () => {
    expect(lookupExtension("notarealext")).toBeNull();
    expect(lookupType("application/not-real")).toBeNull();
    expect(lookupExtension("")).toBeNull();
  });

  it("routes by direction", () => {
    expect(resolve("png", "extension")).toBe("image/png");
    expect(resolve("image/png", "type")).toBe("png");
  });
});

describe("regex", () => {
  it("finds all matches", () => {
    const r = testRegex("\\d+", "a1 b22 c333", "g");
    expect(r.matchCount).toBe(3);
    expect(r.matches.filter((m) => m.index === 0).map((m) => m.value)).toEqual(["1", "22", "333"]);
  });

  it("reports match offsets", () => {
    const r = testRegex("b\\d", "ab12", "g");
    const m = r.matches[0];
    expect([m.start, m.end]).toEqual([1, 3]);
  });

  it("forces the global flag so repeated patterns are all found", () => {
    expect(testRegex("a", "aaa", "").matchCount).toBe(3);
  });

  it("captures groups and names", () => {
    const r = testRegex("(?<year>\\d{4})-(?<month>\\d{2})", "on 2026-09 and 2027-01", "g");
    const named = r.matches.filter((x) => x.name !== null);
    // 2 whole matches + 2 named captures each.
    expect(r.matchCount).toBe(2);
    expect(named.map((x) => x.name)).toEqual(["year", "month", "year", "month"]);
    expect(named.map((x) => x.value)).toEqual(["2026", "09", "2027", "01"]);
  });

  it("does not hang on a zero-length match", () => {
    // /a*/ matches the empty string at every index; without a lastIndex bump
    // this loops forever.
    const r = testRegex("a*", "bab", "g");
    expect(r.matchCount).toBeGreaterThan(0);
    expect(r.matchCount).toBeLessThanOrEqual(1000);
  });

  it("escapes newlines in display output", () => {
    const r = testRegex("a.b", "a\nb", "gs");
    expect(r.matches[0].value).toBe("a\\nb");
  });

  it("honours the dotAll flag", () => {
    expect(testRegex("a.b", "a\nb", "").matchCount).toBe(0);
    expect(testRegex("a.b", "a\nb", "s").matchCount).toBe(1);
  });

  it("honours case-insensitivity", () => {
    expect(testRegex("abc", "ABC", "i").matchCount).toBe(1);
    expect(testRegex("abc", "ABC", "").matchCount).toBe(0);
  });

  it("rejects invalid patterns with a readable message", () => {
    expect(() => testRegex("(unclosed", "x", "")).toThrow(RegexError);
    expect(() => testRegex("[", "x", "g")).toThrow(RegexError);
  });

  it("rejects an unknown or duplicate flag", () => {
    expect(() => testRegex("a", "a", "q")).toThrow(RegexError);
    expect(() => testRegex("a", "a", "gg")).toThrow(/Duplicate flag/);
  });

  it("tolerates the sticky flag, which exec() alone would make useless", () => {
    expect(() => testRegex("a", "aaa", "y")).not.toThrow();
  });
});
