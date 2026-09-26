/**
 * Base64 / URI codecs that survive non-ASCII input.
 *
 * The previous implementation called `btoa`/`atob` directly. Those operate on
 * "binary strings" where every code unit must be < 256, so any non-Latin
 * character (emoji, accents, CJK) throws `InvalidCharacterError` instead of
 * encoding. `TextEncoder`/`TextDecoder` handle the UTF-8 round-trip properly.
 */

/** Encode a UTF-8 string to base64. Works with emoji and non-Latin text. */
export function toBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);

  let binary = "";
  // Chunked to avoid blowing the argument limit on very large inputs.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }

  return btoa(binary);
}

/** Decode base64 back to a UTF-8 string. */
export function fromBase64(input: string): string {
  // Tolerate whitespace/newlines, which are common in wrapped base64.
  const cleaned = input.replace(/\s+/g, "");

  if (cleaned === "") return "";

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error("Input is not valid base64.");
  }

  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

/** Percent-encode a full string. */
export function uriEncode(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Percent-decode. `decodeURIComponent` throws on malformed sequences like a
 * lone `%`, which is common when pasting partial input, so fall back to a
 * lenient decode that leaves bad sequences untouched.
 */
export function uriDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input.replace(/(%[0-9A-Fa-f]{2})+/g, (seq) => {
      try {
        return decodeURIComponent(seq);
      } catch {
        return seq;
      }
    });
  }
}
