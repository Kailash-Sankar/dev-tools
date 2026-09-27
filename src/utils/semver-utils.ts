/**
 * Semantic-version comparison, diffing and range checks.
 *
 * Delegates all ordering to the `semver` package (npm's own, zero deps, ISC)
 * rather than hand-rolling precedence, which is easy to get subtly wrong for
 * prerelease versions.
 */
import semver from "semver";

export class SemverError extends Error {}

export type BumpKind = "major" | "minor" | "patch" | "prerelease" | "premajor" | "preminor" | "prepatch";

export const BUMP_KINDS: BumpKind[] = [
  "major",
  "minor",
  "patch",
  "prerelease",
  "premajor",
  "preminor",
  "prepatch",
];

const parse = (v: string): semver.SemVer => {
  const trimmed = v.trim();
  if (!trimmed) throw new SemverError("Enter a version.");
  // Be forgiving about a leading "v" and about missing minor/patch.
  const normalised = trimmed.startsWith("v") ? trimmed.slice(1) : trimmed;
  const coerced = semver.valid(normalised) ?? semver.coerce(normalised)?.version;
  if (!coerced) throw new SemverError(`"${trimmed}" is not a valid semver version.`);
  return new semver.SemVer(coerced);
};

export type SemverCompare = {
  a: string;
  b: string;
  /** Which of the two is newer. */
  newer: "a" | "b" | "equal";
  /** Human phrasing, e.g. "2.0.0 is 3 major versions ahead". */
  summary: string;
  difference: string | null;
  satisfies: { range: string; ok: boolean }[];
};

/**
 * Which bump type moves `from` up to `to`, e.g. 1.2.3 -> 2.0.0 is "major".
 * Null when the versions are equal.
 *
 * Delegates to semver.diff rather than comparing fields by hand. The
 * hand-rolled version got prereleases wrong: 1.2.3 -> 1.2.4-beta.1 is a
 * *prepatch*, not a patch, and semver already models that distinction.
 */
export const bumpBetween = (from: string, to: string): BumpKind | null =>
  (semver.diff(parse(from).version, parse(to).version) as BumpKind | null) ?? null;

export const compareVersions = (
  rawA: string,
  rawB: string,
  ranges: string[] = []
): SemverCompare => {
  const a = parse(rawA);
  const b = parse(rawB);
  const cmp = semver.compare(a.version, b.version);
  const newer = cmp > 0 ? "a" : cmp < 0 ? "b" : "equal";

  const diff = semver.diff(a.version, b.version);
  const bump = bumpBetween(a.version, b.version);
  let summary: string;
  if (cmp === 0) {
    summary = `${a.version} and ${b.version} are the same version.`;
  } else {
    const [hi, lo] = cmp > 0 ? [a, b] : [b, a];
    const kind = bump === "premajor" || bump === "preminor" || bump === "prepatch" ? "prerelease" : bump;
    const count = kind === "major" ? Math.abs(hi.major - lo.major)
      : kind === "minor" ? Math.abs(hi.minor - lo.minor)
      : Math.abs(hi.patch - lo.patch);
    const word = count === 1 ? kind : `${kind}s`;
    summary = `${hi.version} is ${count} ${word} ahead of ${lo.version}.`;
  }

  // Only offer the range check when both sides are clean releases; a
  // prerelease is excluded from ranges by default in semver, which
  // surprises people, so surface it rather than silently failing.
  const satisfies = ranges
    .map((r) => r.trim())
    .filter(Boolean)
    .map((range) => {
      let ok = false;
      try {
        ok = semver.satisfies(a.version, range, { includePrerelease: true });
      } catch {
        ok = false;
      }
      return { range, ok };
    });

  return { a: a.version, b: b.version, newer, summary, difference: diff, satisfies };
};

export const bumpVersion = (version: string, kind: BumpKind): string =>
  semver.inc(parse(version).version, kind);

export const sortVersions = (versions: string[]): string[] =>
  // Sort the *strings*: rcompare constructs new SemVer from its arguments, so
  // handing it SemVer instances silently yields undefineds.
  versions
    .map((v) => parse(v).version)
    .sort(semver.rcompare);
