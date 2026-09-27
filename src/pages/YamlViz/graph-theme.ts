/**
 * Colours for the sigma graph renderer.
 *
 * sigma draws to a WebGL canvas and cannot read CSS custom properties, so it
 * can't use the theme tokens directly. Instead the palette is resolved from
 * the current theme at render time, so a dark graph doesn't end up with a
 * white canvas and washed-out nodes.
 */
import { useEffect, useState } from "react";

export interface GraphPalette {
  node: string;
  selected: string;
  highlight: string;
  muted: string;
  /** Canvas background, matched to the panel behind it. */
  canvas: string;
}

const DARK: GraphPalette = {
  node: "#7DD3FC",
  selected: "#C084FC",
  highlight: "#FBBF24",
  muted: "#3F3F46",
  canvas: "#18181B",
};

const LIGHT: GraphPalette = {
  node: "#0284C7",
  selected: "#9333EA",
  highlight: "#D97706",
  muted: "#D4D4D8",
  canvas: "#FFFFFF",
};

export const graphPalette = (): GraphPalette =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark")
    ? DARK
    : LIGHT;

/**
 * Returns a value that changes when the app theme flips, so callers can put
 * it in a dependency array to re-render the graph with the new palette.
 */
export function useGraphTheme(): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const mo = new MutationObserver(() => setRevision((r) => r + 1));
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return revision;
}
