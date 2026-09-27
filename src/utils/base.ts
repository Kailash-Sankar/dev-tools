/**
 * Integer base conversion.
 *
 * BigInt rather than Number, because the interesting cases overflow Number's
 * 53-bit safe integer range immediately (0x1fffffffffffff and up), and a base
 * converter that silently rounds is worse than useless.
 *
 * Signed and fractional input is rejected rather than approximated: a
 * truncated float is a bug waiting to be trusted.
 */

export const BASES = [
  { id: 2, label: "Binary", prefix: "0b" },
  { id: 8, label: "Octal", prefix: "0o" },
  { id: 10, label: "Decimal", prefix: "" },
  { id: 16, label: "Hex", prefix: "0x" },
] as const;

export type BaseId = (typeof BASES)[number]["id"];

export class BaseConvertError extends Error {}

/**
 * Parse `input` as a number written in `fromBase`, returning a BigInt.
 * Accepts an optional 0x/0b/0o prefix regardless of the declared base, since
 * that is what people paste.
 */
export function parseInBase(input: string, fromBase: BaseId): bigint {
  const trimmed = input.trim().replace(/[\s_,]/g, "");
  if (!trimmed) throw new BaseConvertError("Enter a number to convert.");

  if (!/^[+-]?(0[xXbBoO])?[0-9a-fA-F]+$/.test(trimmed)) {
    throw new BaseConvertError(
      `"${input.trim()}" is not a valid base-${fromBase} integer. Fractions are not supported.`
    );
  }

  const sign = trimmed.startsWith("-") ? -1n : 1n;
  const unsigned = trimmed.replace(/^[+-]/, "");

  // An explicit radix prefix wins over the declared base.
  const prefixed = /^0([xXbBoO])([0-9a-fA-F]+)$/.exec(unsigned);

  const PREFIX = { 2: "0b", 8: "0o", 10: "", 16: "0x" } as const;
  const prefixFor = (b: number) => (PREFIX as Record<number, string>)[b] ?? "";

  const digits = prefixed ? prefixed[2] : unsigned;
  const radix = prefixed
    ? { x: 16, b: 2, o: 8 }[prefixed[1].toLowerCase() as "x" | "b" | "o"]
    : fromBase;

  let value: bigint;
  try {
    // Base 10 takes no prefix -- there is no "0d" in BigInt, and
    // BigInt("255") is already decimal.
    value = BigInt(prefixFor(radix) + digits);
  } catch {
    // BigInt throws SyntaxError for a digit outside the radix, e.g. "2" in
    // base 2. That is an input problem, so it becomes a domain error.
    throw new BaseConvertError(
      `"${input.trim()}" is not a valid base-${radix} integer.`
    );
  }
  return sign * value;
}

export const formatInBase = (value: bigint, base: BaseId): string => value.toString(base);

/** All four representations of one value, keyed by base. */
export const toAllBases = (value: bigint): Record<BaseId, string> => ({
  2: formatInBase(value, 2),
  8: formatInBase(value, 8),
  10: formatInBase(value, 10),
  16: formatInBase(value, 16),
});

/**
 * Discriminated result so callers can narrow on `ok` and get a `bigint`
 * back, rather than on a derived truthy value that TypeScript cannot
 * correlate with the parse.
 */
export type ConvertResult =
  | { ok: true; value: bigint }
  | { ok: false; error: string };

export const bitLength = (value: bigint): number => {
  if (value === 0n) return 0;
  const abs = value < 0n ? -value : value;
  return abs.toString(2).length;
};
