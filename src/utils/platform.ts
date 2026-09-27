/**
 * Platform detection for keyboard shortcut labels.
 *
 * Only ever called from the client (inside an effect), so touching navigator
 * here is safe; it is kept out of module scope so SSR/test environments that
 * lack `navigator` don't break at import time.
 */
export const isMac = (): boolean =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/** True when the platform's primary modifier is ⌘ rather than Ctrl. */
export const isModKey = (e: KeyboardEvent | React.KeyboardEvent): boolean =>
  isMac() ? e.metaKey : e.ctrlKey;

/** Human label for the primary modifier, e.g. "⌘" or "Ctrl". */
export const modLabel = (): string => (isMac() ? "⌘" : "Ctrl");
