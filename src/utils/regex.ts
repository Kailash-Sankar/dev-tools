/**
 * Regular expression testing, using the platform's own RegExp engine.
 *
 * No dependency, and that is a feature rather than an accident: the point of
 * this tool is to see how *your* target runtime's engine behaves, so testing
 * against a third-party regex implementation would be misleading.
 *
 * SAFETY NOTE, surfaced in the UI: JavaScript has no regex timeout. A
 * pattern with catastrophic backtracking -- `(a+)+$` against a long run of
 * "a" -- will lock the tab with no way to cancel. That is inherent to the
 * engine, not a bug here, and the UI warns about it.
 */

export class RegexError extends Error {}

export type MatchGroup = {
  /** Whole match, or a capture group. */
  value: string;
  /** Capture group index; 0 is the whole match. */
  index: number;
  /** Capture group name, when the pattern uses (?<name>...). */
  name: string | null;
  start: number;
  end: number;
};

export type RegexResult = {
  pattern: string;
  flags: string;
  matches: MatchGroup[];
  matchCount: number;
};

const toDisplay = (s: string): string =>
  // newlines would break the one-row-per-match table
  s.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");

/**
 * Compile and run a pattern.
 *
 * `global` is always forced on so all matches are enumerated; without it
 * exec() returns only the first, which is a common source of confusion when
 * someone tests a pattern they expect to repeat.
 */
export function testRegex(
  pattern: string,
  input: string,
  flagsInput: string
): RegexResult {
  // Deduplicate and validate. Invalid or duplicate flags throw in the
  // constructor, so this surfaces them with a readable message.
  const seen = new Set<string>();
  for (const f of flagsInput) {
    if (seen.has(f)) throw new RegexError(`Duplicate flag: ${f}`);
    seen.add(f);
  }
  const flags = [...seen].join("");

  let re: RegExp;
  try {
    re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
  } catch (e) {
    throw new RegexError(e instanceof Error ? e.message : "Invalid regular expression.");
  }

  const matches: MatchGroup[] = [];
  // Bounded so a pattern that matches the empty string at every position
  // (e.g. /a*/) cannot spin forever.
  const MAX_MATCHES = 1000;
  const guard = re;
  let m: RegExpExecArray | null;

  while ((m = guard.exec(input)) !== null) {
    // Record the whole match, then any capture groups.
    matches.push({
      value: toDisplay(m[0]),
      index: 0,
      name: null,
      start: m.index,
      end: m.index + m[0].length,
    });
    for (let g = 1; g < m.length; g++) {
      const named = m.groups
        ? Object.entries(m.groups).find(([, v]) => v === m![g])?.[0] ?? null
        : null;
      matches.push({
        value: toDisplay(m[g] ?? ""),
        index: g,
        name: named,
        start: -1,
        end: -1,
      });
    }

    if (matches.length >= MAX_MATCHES) break;
    // A zero-length match would otherwise leave lastIndex unchanged and
    // loop forever.
    if (m[0].length === 0) guard.lastIndex += 1;
  }

  return {
    pattern,
    flags,
    matches,
    matchCount: matches.filter((x) => x.index === 0).length,
  };
}

export const FLAGS: { id: string; label: string; note: string }[] = [
  { id: "g", label: "g", note: "global — find all matches" },
  { id: "i", label: "i", note: "ignore case" },
  { id: "m", label: "m", note: "multiline — ^ and $ match each line" },
  { id: "s", label: "s", note: "dotAll — . also matches newlines" },
  { id: "u", label: "u", note: "unicode" },
  { id: "y", label: "y", note: "sticky — match only at lastIndex" },
];

export const COMMON_PATTERNS: { label: string; pattern: string; flags: string }[] = [
  { label: "Email", pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.]+", flags: "gi" },
  { label: "URL", pattern: "https?://[^\\s)]+", flags: "g" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { label: "ISO date", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
  { label: "Hex colour", pattern: "#(?:[0-9a-f]{3}|[0-9a-f]{6})\\b", flags: "gi" },
  { label: "Named group", pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})", flags: "g" },
  { label: "⚠ ReDoS", pattern: "(a+)+$", flags: "" },
];
