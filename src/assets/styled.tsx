import type { HTMLAttributes } from "react";

/** Per-glyph animation classes. These MUST stay written out in full as literals:
 *  Tailwind scans source text for class names, so a dynamically built
 *  `animate-${name}` would never be generated in the CSS bundle. */
const GLYPH_CLASSES = [
  "key animate-key-1",
  "key animate-key-2",
  "key animate-key-3",
  "key animate-key-4",
  "key animate-key-5",
  "key animate-key-6",
  "key animate-key-7",
  "key animate-key-8",
] as const;

/**
 * Animated "DEV TOOLS" wordmark on the home page.
 *
 * Previously a styled-components block; the keyframes now live in
 * `index.css` under `@theme` as `--animate-key-*` tokens so Tailwind owns them.
 */
export const TypeEffect = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props}>
    {Array.from("DEV TOOLS").map((char, i) =>
      char === " " ? (
        <span key={i} className="w-[1ch]">
          &nbsp;
        </span>
      ) : (
        <span key={i} className={GLYPH_CLASSES[i % GLYPH_CLASSES.length]}>
          {char}
        </span>
      )
    )}
  </div>
);
