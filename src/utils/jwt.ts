/**
 * JWT *decoding* (not verification).
 *
 * A JWT is `base64url(header).base64url(payload).base64url(signature)`.
 * Decoding is just base64url + JSON.parse, so it needs no crypto and no
 * key -- and that is exactly why it proves nothing about authenticity.
 * Anyone can mint a token claiming to be an admin.
 *
 * This module therefore never returns anything resembling a "valid" verdict.
 * The UI must show the "unverified" warning; see JwtDecoder.tsx.
 */
import { jwtDecode } from "jwt-decode";

export type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Raw signature segment, base64url. Not a key and not verifiable here. */
  signature: string;
  alg: string | null;
  /** Seconds since epoch, when present and numeric. */
  exp: number | null;
  iat: number | null;
  nbf: number | null;
  /** Time left before `exp`, in ms. Negative once expired. */
  expiresInMs: number | null;
  isExpired: boolean;
  /** True when nbf is still in the future. */
  notYetValid: boolean;
};

export class JwtDecodeError extends Error {}

const segmentAsJson = (segment: string, which: string): Record<string, unknown> => {
  // base64url uses "-" and "_" in place of "+" and "/", and drops padding.
  const b64 = segment
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(segment.length + ((4 - (segment.length % 4)) % 4), "=");
  try {
    const parsed = JSON.parse(atob(b64));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${which} is not a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (e) {
    throw new JwtDecodeError(
      `The ${which} segment is not valid JSON, so this is not a decodable JWT.` +
        (e instanceof Error && /JSON object/.test(e.message) ? ` ${e.message}.` : "")
    );
  }
};

const asNumber = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

export function decodeJwt(token: string, now: number = Date.now()): DecodedJwt {
  const trimmed = token.trim();
  if (!trimmed) throw new JwtDecodeError("Paste a token first.");

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new JwtDecodeError(
      `A JWT has exactly 3 dot-separated parts; this has ${parts.length}. ` +
        (parts.length === 1
          ? "It may be a secret or a hash rather than a token."
          : "It may be truncated.")
    );
  }

  // The payload is decoded by `jwt-decode`. The base64url -> JSON step looks
  // trivial, but it has real edge cases (padding, the URL-safe alphabet,
  // unicode) on input that is untrusted by definition, so it is worth using a
  // library that has been fuzzed against them.
  //
  // API note: jwt-decode v3 returned `{ header, payload, signature }` from
  // `jwtDecode(token, { header: true })`. v4 returns the header object
  // *itself*, so the header is decoded separately here. The signature is
  // never decoded by anyone -- it is a signature, not data.
  let payload: Record<string, unknown>;
  try {
    payload = jwtDecode<Record<string, unknown>>(trimmed);
  } catch (e) {
    throw new JwtDecodeError(
      `The payload segment is not valid JSON, so this is not a decodable JWT. ` +
        (e instanceof Error ? e.message : String(e))
    );
  }

  const [headerSeg, , signature] = parts;
  const header = segmentAsJson(headerSeg, "header");

  const exp = asNumber(payload.exp);
  const iat = asNumber(payload.iat);
  const nbf = asNumber(payload.nbf);

  return {
    header,
    payload,
    signature,
    alg: typeof header.alg === "string" ? header.alg : null,
    exp,
    iat,
    nbf,
    expiresInMs: exp === null ? null : exp * 1000 - now,
    isExpired: exp !== null && exp * 1000 <= now,
    notYetValid: nbf !== null && nbf * 1000 > now,
  };
}

/** Seconds-since-epoch claims, rendered as local ISO strings. */
export const timestampClaims = (d: DecodedJwt): { claim: string; value: string }[] => {
  const rows: { claim: string; value: string }[] = [];
  const add = (claim: string, seconds: number | null) => {
    if (seconds === null) return;
    const date = new Date(seconds * 1000);
    if (Number.isNaN(date.getTime())) return;
    rows.push({ claim, value: date.toISOString() });
  };
  add("iat", d.iat);
  add("nbf", d.nbf);
  add("exp", d.exp);
  return rows;
};
