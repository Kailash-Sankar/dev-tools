/**
 * SHA-family hashing via WebCrypto.
 *
 * No dependency: `crypto.subtle` is built into the browser and gives us the
 * real NIST implementations, so hashes here are verifiable with `shasum -a
 * 256` / `openssl dgst -sha256`.
 *
 * MD5 is deliberately absent. It is not part of WebCrypto (it is not
 * collision-resistant, and the platform refuses to provide it), and the
 * usual npm packages are unmaintained. Rather than ship a hand-rolled MD5
 * that a reader might trust for integrity, this omits it.
 *
 * `crypto.subtle` requires a *secure context*: https, or http on localhost.
 * Over plain http on a LAN IP it is `undefined`, which is why
 * `isSubtleCryptoAvailable()` exists and the UI surfaces it rather than
 * throwing.
 */

export const HASH_ALGORITHMS = [
  { id: "SHA-1", label: "SHA-1", note: "Legacy. Use for compatibility, not security." },
  { id: "SHA-256", label: "SHA-256", note: "Default choice." },
  { id: "SHA-384", label: "SHA-384", note: "SHA-512 truncated to 384 bits." },
  { id: "SHA-512", label: "SHA-512", note: "Strongest of the four." },
] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]["id"];

export function isSubtleCryptoAvailable(): boolean {
  return typeof crypto !== "undefined" && typeof crypto.subtle?.digest === "function";
}

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/**
 * Hash a UTF-8 string.
 *
 * The TextEncoder step is essential and easy to get wrong: passing the raw
 * JS string to `digest()` would hash the UTF-16 code units instead, giving
 * different bytes (and a different digest) for anything non-ASCII.
 */
export async function hashText(
  text: string,
  algorithm: HashAlgorithm = "SHA-256"
): Promise<string> {
  if (!isSubtleCryptoAvailable()) {
    throw new Error(
      "crypto.subtle is unavailable. This page must be served over https or from localhost."
    );
  }

  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, data as unknown as BufferSource);
  return toHex(digest);
}

/** Hash every algorithm at once, for a single input. */
export async function hashAll(text: string): Promise<Record<HashAlgorithm, string>> {
  const entries = await Promise.all(
    HASH_ALGORITHMS.map(async (a) => [a.id, await hashText(text, a.id)] as const)
  );
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
}
