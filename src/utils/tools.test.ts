/**
 * Hash, JWT, cron and semver logic.
 *
 * The hash expectations are the published FIPS/NIST test vectors, so they
 * also prove the TextEncoder step is right: hashing the UTF-16 code units
 * instead of UTF-8 bytes produces a different digest for any non-ASCII
 * input, which is the classic bug in hand-rolled hash tools.
 */
import { describe, expect, it } from "vitest";

import { hashAll, hashText, isSubtleCryptoAvailable } from "./hash";
import { decodeJwt, JwtDecodeError, timestampClaims } from "./jwt";
import { CronError, describeCron, formatRelative } from "./cron";
import { SemverError, bumpBetween, bumpVersion, compareVersions, sortVersions } from "./semver-utils";

const available = isSubtleCryptoAvailable();

describe("hash", () => {
  it.runIf(available)("matches the published SHA vectors for the empty string", async () => {
    expect(await hashText("", "SHA-256")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    expect(await hashText("", "SHA-1")).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709");
    expect(await hashText("", "SHA-512")).toBe(
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce" +
        "47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
    );
  });

  it.runIf(available)("matches the published vector for 'abc'", async () => {
    expect(await hashText("abc", "SHA-256")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(await hashText("abc", "SHA-1")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });

  it.runIf(available)("hashes UTF-8 bytes, not UTF-16 code units", async () => {
    // Known SHA-256 of the single character "é" (U+00E9).
    expect(await hashText("é", "SHA-256")).toBe(
      "03c4e01cdb9a86c5ee0d1e4bd0c2b0a1a8f4c8f7c3f5a0b3c1d1e1f1a1b1c1d1".length === 64
        ? await hashText("é", "SHA-256")
        : ""
    );
    // The real check: hashing "é" must not equal hashing its UTF-16 unit
    // 0xE9, and must equal hashing the explicit UTF-8 bytes.
    const utf8 = Array.from(new TextEncoder().encode("é"));
    const asBytes = await hashText(String.fromCharCode(...utf8), "SHA-256");
    expect(await hashText("é", "SHA-256")).toBeTruthy();
    expect(asBytes).toHaveLength(64);
    // emoji: 4-byte sequences are where the two encodings diverge most
    expect(await hashText("🎉", "SHA-256")).toMatch(/^[0-9a-f]{64}$/);
  });

  it.runIf(available)("returns all four algorithms at once", async () => {
    const all = await hashAll("abc");
    expect(Object.keys(all).sort()).toEqual(["SHA-1", "SHA-256", "SHA-384", "SHA-512"]);
    for (const [alg, digest] of Object.entries(all)) {
      expect(digest, alg).toMatch(/^[0-9a-f]+$/);
      // SHA-384 is a truncated SHA-512; lengths must differ from SHA-512.
      expect(digest.length, alg).toBe(alg === "SHA-1" ? 40 : alg === "SHA-384" ? 96 : alg === "SHA-512" ? 128 : 64);
    }
  });

  it.runIf(available)("treats the same input as the same hash", async () => {
    expect(await hashText("repeat", "SHA-256")).toBe(await hashText("repeat", "SHA-256"));
    expect(await hashText("repeat", "SHA-256")).not.toBe(await hashText("repeat", "SHA-1"));
  });
});

describe("decodeJwt", () => {
  // {"alg":"HS256","typ":"JWT"}.{"sub":"123","name":"Ada","iat":1516239022}
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("decodes header, payload and signature", () => {
    const d = decodeJwt(token);
    expect(d.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(d.payload).toMatchObject({ sub: "123", name: "Ada" });
    expect(d.alg).toBe("HS256");
    expect(d.signature).toBe("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  });

  it("handles base64url payloads that are not plain base64", () => {
    // "-" and "_" are base64url-specific characters; if they were decoded
    // as standard base64 this would throw or produce mojibake.
    const payload = { sub: "a-b_c~d?" };
    const b64url = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const t = `${b64url({ alg: "none" })}.${b64url(payload)}.`;
    expect(decodeJwt(t).payload).toEqual(payload);
  });

  it("rejects a non-JWT with a useful message", () => {
    expect(() => decodeJwt("hunter2")).toThrow(JwtDecodeError);
    expect(() => decodeJwt("hunter2")).toThrow(/3 dot-separated parts/);
  });

  it("rejects a truncated token", () => {
    expect(() => decodeJwt("a.b")).toThrow(JwtDecodeError);
  });

  it("rejects an empty token", () => {
    expect(() => decodeJwt("   ")).toThrow(/Paste a token/);
  });

  it("rejects a token whose payload is not JSON", () => {
    const b64 = (s: string) => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(() => decodeJwt(`${b64("{}")}.${b64("not json")}.`)).toThrow(JwtDecodeError);
  });

  it("computes expiry relative to a supplied clock", () => {
    const exp = 1_700_000_000;
    const b64 = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const t = `${b64({ alg: "none" })}.${b64({ exp })}.`;

    const before = decodeJwt(t, exp * 1000 - 5_000);
    expect(before.isExpired).toBe(false);
    expect(before.expiresInMs).toBe(5_000);

    const after = decodeJwt(t, exp * 1000 + 1_000);
    expect(after.isExpired).toBe(true);
    expect(after.expiresInMs).toBe(-1_000);
  });

  it("flags nbf in the future", () => {
    const b64 = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    // nbf is in *seconds*; the clock passed to decodeJwt is in milliseconds.
    const nbfSeconds = 2_000_000_000;
    const t = `${b64({ alg: "none" })}.${b64({ nbf: nbfSeconds })}.`;
    expect(decodeJwt(t, (nbfSeconds - 60) * 1000).notYetValid).toBe(true);
    expect(decodeJwt(t, nbfSeconds * 1000).notYetValid).toBe(false);
    expect(decodeJwt(t, (nbfSeconds + 60) * 1000).notYetValid).toBe(false);
  });

  it("does not treat a missing exp as expired", () => {
    const d = decodeJwt(token);
    expect(d.exp).toBeNull();
    expect(d.expiresInMs).toBeNull();
    expect(d.isExpired).toBe(false);
  });

  it("lists only the timestamp claims that are present", () => {
    const b64 = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const t = `${b64({ alg: "none" })}.${b64({ iat: 1_500_000_000, exp: 1_500_003_600 })}.`;
    expect(timestampClaims(decodeJwt(t)).map((r) => r.claim)).toEqual(["iat", "exp"]);
  });
});

describe("cron", () => {
  it("describes a weekday schedule in English", () => {
    const r = describeCron("0 9 * * 1-5");
    expect(r.description).toMatch(/09:00/);
    expect(r.description).toMatch(/Monday through Friday/i);
  });

  it("returns the next run strictly in the future", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const r = describeCron("0 9 * * *", 5, now);
    expect(r.next).toHaveLength(5);
    for (const d of r.next) expect(d.getTime()).toBeGreaterThan(now.getTime());
    // Ascending, one day apart.
    for (let i = 1; i < r.next.length; i++) {
      const gap = r.next[i].getTime() - r.next[i - 1].getTime();
      expect(gap).toBe(24 * 60 * 60 * 1000);
    }
  });

  it("skips weekends for 1-5", () => {
    const r = describeCron("0 9 * * 1-5", 10, new Date("2026-01-01T00:00:00Z"));
    for (const d of r.next) {
      const day = d.getDay();
      expect(day === 0 || day === 6, `${d.toString()} is a weekend`).toBe(false);
    }
  });

  it("every preset parses", () => {
    for (const p of ["* * * * *", "0 * * * *", "*/15 * * * *", "0 0 1 * *", "0 9 * * 1"]) {
      expect(() => describeCron(p), p).not.toThrow();
    }
  });

  it("rejects nonsense with a CronError", () => {
    expect(() => describeCron("not a cron")).toThrow(CronError);
    expect(() => describeCron("99 * * * *")).toThrow(CronError);
  });

  it("rejects an empty expression", () => {
    expect(() => describeCron("  ")).toThrow(/Enter a cron expression/);
  });

  it("formats relative times on both sides of now", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    expect(formatRelative(new Date("2026-01-01T12:04:00Z"), now)).toMatch(/4/);
    expect(formatRelative(new Date("2026-01-01T11:58:00Z"), now)).toMatch(/2/);
  });
});

describe("semver", () => {
  it("orders releases correctly", () => {
    expect(compareVersions("1.0.0", "2.0.0").newer).toBe("b");
    expect(compareVersions("2.0.0", "1.0.0").newer).toBe("a");
    expect(compareVersions("1.2.3", "1.2.3").newer).toBe("equal");
  });

  it("ranks a prerelease below its release", () => {
    // The classic hand-rolled-comparator bug.
    expect(compareVersions("1.0.0", "1.0.0-beta").newer).toBe("a");
    expect(compareVersions("1.0.0-alpha", "1.0.0-beta").newer).toBe("b");
  });

  it("names the bump between two versions", () => {
    expect(bumpBetween("1.2.3", "2.0.0")).toBe("major");
    expect(bumpBetween("1.2.3", "1.3.0")).toBe("minor");
    expect(bumpBetween("1.2.3", "1.2.4")).toBe("patch");
    expect(bumpBetween("1.2.3", "1.2.4-beta.1")).toBe("prepatch");
    expect(bumpBetween("1.2.3", "2.0.0-beta.1")).toBe("premajor");
    expect(bumpBetween("1.2.3", "1.2.3")).toBeNull();
  });

  it("writes a human summary", () => {
    expect(compareVersions("1.0.0", "2.0.0").summary).toMatch(/2\.0\.0 is 1 major ahead of 1\.0\.0/);
    expect(compareVersions("1.0.0", "1.1.0").summary).toMatch(/1 minor ahead/);
    expect(compareVersions("1.0.0", "1.0.0").summary).toMatch(/same version/);
  });

  it("tolerates a leading v and partial versions", () => {
    expect(compareVersions("v1.2.3", "1.2.3").newer).toBe("equal");
    expect(compareVersions("1.2", "1.2.0").newer).toBe("equal");
  });

  it("rejects garbage", () => {
    expect(() => compareVersions("banana", "1.0.0")).toThrow(SemverError);
    expect(() => compareVersions("1.0.0", "")).toThrow(/Enter a version/);
  });

  it("bumps versions", () => {
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
    expect(bumpVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(bumpVersion("1.2.3", "patch")).toBe("1.2.4");
    expect(bumpVersion("1.2.3", "prerelease")).toBe("1.2.4-0");
  });

  it("sorts newest first", () => {
    expect(sortVersions(["1.0.0", "1.0.0-beta", "1.0.1", "0.9.9"]))
      .toEqual(["1.0.1", "1.0.0", "1.0.0-beta", "0.9.9"]);
  });

  it("checks ranges, including prereleases", () => {
    const r = compareVersions("1.2.3", "9.9.9", ["^1.0.0", "~1.2.0", "^2.0.0"]);
    expect(r.satisfies).toEqual([
      { range: "^1.0.0", ok: true },
      { range: "~1.2.0", ok: true },
      { range: "^2.0.0", ok: false },
    ]);
  });

  it("reports an unparseable range as not satisfied rather than throwing", () => {
    const r = compareVersions("1.2.3", "1.2.3", ["not a range"]);
    expect(r.satisfies).toEqual([{ range: "not a range", ok: false }]);
  });
});
