/**
 * Example site palettes for the colour picker.
 *
 * Every hex below is the sRGB rendering of the OKLCH value in the installed
 * `tailwindcss@4` theme, converted via the CSS Color 4 conversion and
 * cross-checked against a browser canvas render (both agree).
 *
 * These differ slightly from the widely-quoted Tailwind v3 hexes -- v4
 * respecified the palette in OKLCH, so e.g. sky-600 is #0084d1 here rather
 * than v3's #0284c7. If you are matching v3, or any other design system,
 * swap these values out; nothing else depends on them being Tailwind's.
 *
 * Ramp steps are chosen so white labels clear WCAG AA (4.5:1) on every
 * filled role. The obvious -600 picks do NOT: sky-600 is 4.02:1 and
 * amber-600 is 3.20:1, so the solid steps start one or two shades darker.
 * palettes.test.ts asserts this for every palette and role.
 */

export type PaletteRole =
  | "bg"
  | "surface"
  | "border"
  | "text"
  | "muted"
  | "primary"
  | "primaryHover"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export interface Palette {
  id: string;
  name: string;
  /** One line on the mood this palette gives a site. */
  note: string;
  colors: Record<PaletteRole, string>;
}

/** Display order, and the order the swatches render in. */
export const PALETTE_ROLES: { role: PaletteRole; label: string }[] = [
  { role: "bg", label: "Page" },
  { role: "surface", label: "Surface" },
  { role: "border", label: "Border" },
  { role: "text", label: "Text" },
  { role: "muted", label: "Muted" },
  { role: "primary", label: "Primary" },
  { role: "primaryHover", label: "Primary hover" },
  { role: "accent", label: "Accent" },
  { role: "success", label: "Success" },
  { role: "warning", label: "Warning" },
  { role: "danger", label: "Danger" },
];

export const PALETTES: Palette[] = [
  {
    id: "slate-sky",
    name: "Slate + Sky",
    note: "Cool neutral with a blue accent. The safe default.",
    colors: {
      bg: "#f8fafc", // slate-50
      surface: "#ffffff",
      border: "#e2e8f0", // slate-200
      text: "#0f172b", // slate-900
      muted: "#62748e", // slate-500
      primary: "#0069a8", // sky-700 (sky-600 is 4.02:1, too light for white)
      primaryHover: "#075985", // sky-800
      accent: "#00a6f4", // sky-500
      success: "#016630", // green-800
      warning: "#a65f00", // yellow-700
      danger: "#c10007", // red-700
    },
  },
  {
    id: "zinc-violet",
    name: "Zinc + Violet",
    note: "Neutral grey with a saturated violet. Reads more modern.",
    colors: {
      bg: "#fafafa", // zinc-50
      surface: "#ffffff",
      border: "#e4e4e7", // zinc-200
      text: "#18181b", // zinc-900
      muted: "#71717b", // zinc-500
      primary: "#7f22fe", // violet-600
      primaryHover: "#7008e7", // violet-700
      accent: "#8e51ff", // violet-500
      success: "#016630", // green-800
      warning: "#bb4d00", // amber-700
      danger: "#c10007", // red-700
    },
  },
  {
    id: "stone-amber",
    name: "Stone + Amber",
    note: "Warm neutral with orange. Editorial and less clinical.",
    colors: {
      bg: "#fafaf9", // stone-50
      surface: "#ffffff",
      border: "#e7e5e4", // stone-200
      text: "#1c1917", // stone-900
      muted: "#79716b", // stone-500
      primary: "#bb4d00", // amber-700 (amber-600 is 3.20:1, too light)
      primaryHover: "#92400e", // amber-800
      accent: "#fe9a00", // amber-500
      success: "#016630", // green-800
      warning: "#a65f00", // yellow-700
      danger: "#c10007", // red-700
    },
  },
];

export const getPalette = (id: string): Palette | undefined =>
  PALETTES.find((p) => p.id === id);

/** Every distinct colour across every palette, de-duplicated. */
export const allPaletteColors = (): string[] => [
  ...new Set(PALETTES.flatMap((p) => Object.values(p.colors))),
];
