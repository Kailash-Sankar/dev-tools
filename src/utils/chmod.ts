/**
 * POSIX file-permission ("chmod") conversion.
 *
 * The mode is nine permission bits -- r/w/x for user, group, other -- usually
 * written in octal, plus three special bits: setuid, setgid and sticky.
 */

export const PERMISSION_GROUPS = [
  { id: "user", label: "User", bit: 6 },
  { id: "group", label: "Group", bit: 3 },
  { id: "other", label: "Other", bit: 0 },
] as const;

export type PermissionGroupId = (typeof PERMISSION_GROUPS)[number]["id"];
export type PermissionTriplet = [boolean, boolean, boolean];

export type SpecialBit = { id: "setuid" | "setgid" | "sticky"; label: string; octal: number; note: string };

export const SPECIAL_BITS: SpecialBit[] = [
  { id: "setuid", label: "setuid", octal: 0o4000, note: "Run as the file owner. Ignored on directories." },
  { id: "setgid", label: "setgid", octal: 0o2000, note: "Run with the group; on a directory, new files inherit its group." },
  { id: "sticky", label: "sticky", octal: 0o1000, note: "On a directory, only the owner may delete entries." },
];

export class ChmodError extends Error {}

/** Permission bits, keyed by group, as [read, write, execute]. */
export type Permissions = Record<PermissionGroupId, PermissionTriplet>;

const EMPTY: Permissions = { user: [false, false, false], group: [false, false, false], other: [false, false, false] };

const formatOctal = (n: number) => (n & 0o7777).toString(8).padStart(3, "0");

/** Build a Permissions map from explicit triplets. */
export const fromTriplets = (
  user: PermissionTriplet,
  group: PermissionTriplet,
  other: PermissionTriplet
): Permissions => ({ user, group, other });

/** Read the permission bits out of an octal mode such as 755 or 0o755. */
export function fromOctal(octal: string): Permissions {
  const digits = octal.trim().replace(/^0o/i, "");
  if (!/^[0-7]{1,4}$/.test(digits)) {
    throw new ChmodError(`"${octal.trim()}" is not an octal mode. Use digits 0-7, e.g. 755.`);
  }
  const n = parseInt(digits, 8);
  return {
    user: [Boolean(n & 0o400), Boolean(n & 0o200), Boolean(n & 0o100)],
    group: [Boolean(n & 0o040), Boolean(n & 0o020), Boolean(n & 0o010)],
    other: [Boolean(n & 0o004), Boolean(n & 0o002), Boolean(n & 0o001)],
  };
}

const bit = (t: PermissionTriplet) => (t[0] ? 0o4 : 0) | (t[1] ? 0o2 : 0) | (t[2] ? 0o1 : 0);

/** Render Permissions (plus optional special bits) as a 3-4 digit octal mode. */
export function toOctal(perms: Permissions, specials: string[] = []): string {
  const n =
    bit(perms.user) * 0o100 +
    bit(perms.group) * 0o10 +
    bit(perms.other) +
    specials.reduce((acc, id) => acc + (SPECIAL_BITS.find((s) => s.id === id)?.octal ?? 0), 0);
  return formatOctal(n);
}

/** The familiar `drwxr-xr-x` form, e.g. for a directory. */
export function toSymbolic(perms: Permissions, isDir = false): string {
  const part = (t: PermissionTriplet) =>
    `${t[0] ? "r" : "-"}${t[1] ? "w" : "-"}${t[2] ? "x" : "-"}`;
  return `${isDir ? "d" : "-"}${part(perms.user)}${part(perms.group)}${part(perms.other)}`;
}

export { EMPTY as NO_PERMISSIONS };
