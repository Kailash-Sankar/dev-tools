/**
 * UUID and ULID generation.
 *
 * No dependency: both formats are just random bytes, which the platform
 * provides via `crypto.getRandomValues` (a CSPRNG, unlike Math.random).
 *
 *   UUID v4  RFC 9562 -- 122 random bits, 6 fixed bits. Collision risk is
 *                     negligible below ~2^61 generated ids.
 *   ULID     128 bits -- 48-bit millisecond timestamp + 80 random bits, in
 *                     Crockford base32. The time prefix makes ids sort
 *                     chronologically, which UUIDs do not.
 */

/** Crockford base32: no I, L, O or U, so ids can't contain 1/I or 0/O. */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export type IdFormat = "uuid4" | "ulid";

const randomBytes = (n: number): Uint8Array => {
  const bytes = new Uint8Array(n);
  // getRandomValues is limited to 65536 bytes per call; we never come close.
  crypto.getRandomValues(bytes);
  return bytes;
};

const hex = (b: Uint8Array) =>
  Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

/**
 * RFC 9562 UUID version 4: set the version nibble to 4 and the variant bits
 * to 10. Getting either wrong yields a string that *looks* right but fails
 * validation, so they are set explicitly rather than assumed random.
 */
export function uuid4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
  const s = hex(b);
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/**
 * ULID: 48-bit timestamp + 80-bit random, Crockford base32, 26 chars.
 *
 * 26 chars x 5 bits = 130, so the leading 2 bits are always zero: 10 chars
 * carry the 48-bit timestamp and the remaining 16 carry the 80 random bits.
 * The whole thing is encoded as one 128-bit integer, MSB first, because
 * per-byte encoding does not line up with a 5-bit alphabet.
 *
 * `randomness` is injectable purely so the spec's published test vector can
 * be checked; callers use the CSPRNG.
 */
export function ulid(now: number = Date.now(), randomness?: Uint8Array): string {
  if (now < 0 || now > 281_474_976_710_655) {
    throw new Error("Timestamp out of range for a 48-bit ULID.");
  }
  const bytes = randomness ?? randomBytes(10);
  if (bytes.length !== 10) throw new Error("ULID randomness must be 10 bytes.");

  let n = BigInt(Math.floor(now));
  for (const b of bytes) n = (n << 8n) | BigInt(b);

  let out = "";
  for (let i = 0; i < 26; i++) {
    out += CROCKFORD[Number((n >> BigInt(5 * (25 - i))) & 31n)];
  }
  return out;
}

/**
 * Recover the creation time from a ULID, in ms since epoch.
 * The timestamp occupies the first 10 characters.
 */
export function ulidTimestamp(id: string): number | null {
  if (id.length !== 26) return null;
  let ms = 0;
  for (const ch of id.slice(0, 10).toUpperCase()) {
    const idx = CROCKFORD.indexOf(ch);
    if (idx === -1) return null;
    ms = ms * 32 + idx;
  }
  // A valid ULID cannot exceed 2^48-1 ms.
  return ms > 281_474_976_710_655 ? null : ms;
}

export const generateId = (format: IdFormat): string =>
  format === "uuid4" ? uuid4() : ulid();

export const ID_FORMATS: { id: IdFormat; label: string; note: string }[] = [
  { id: "uuid4", label: "UUID v4", note: "122 random bits. Random, not sortable." },
  { id: "ulid", label: "ULID", note: "48-bit timestamp + 80 random bits. Lexicographically sortable." },
];
