import { describe, expect, it } from "vitest";

import { contrastRatio, isLight, relativeLuminance } from "./color";
import { PALETTE_ROLES, PALETTES, allPaletteColors, getPalette } from "./palettes";

describe("contrastRatio", () => {
  it("matches the WCAG reference extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#000000", "#000000")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#0084d1", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#0084d1"),
      10
    );
  });

  it("handles #767676 on white, the classic 4.54:1 AA boundary", () => {
    // The canonical "smallest greyscale that passes AA on white" value.
    const r = contrastRatio("#767676", "#ffffff");
    expect(r).toBeGreaterThanOrEqual(4.5);
    expect(r).toBeLessThan(4.6);
  });

  it("places relativeLuminance at the documented endpoints", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 10);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 10);
  });
});

describe("palettes", () => {
  it("exposes the three example palettes", () => {
    expect(PALETTES).toHaveLength(3);
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(3);
  });

  it("gives every palette exactly the same roles, all filled", () => {
    const roles = PALETTE_ROLES.map((r) => r.role);
    for (const p of PALETTES) {
      expect(Object.keys(p.colors).sort(), `${p.id} roles`).toEqual([...roles].sort());
      for (const [role, hex] of Object.entries(p.colors)) {
        expect(hex, `${p.id}.${role}`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("is internally coherent as a site palette", () => {
    for (const p of PALETTES) {
      const c = p.colors;
      // Body text must clear AA on both the page and any raised surface.
      expect(contrastRatio(c.text, c.bg), `${p.id} text on bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.text, c.surface), `${p.id} text on surface`).toBeGreaterThanOrEqual(4.5);
      // Muted text still has to be readable, not decorative.
      expect(contrastRatio(c.muted, c.bg), `${p.id} muted on bg`).toBeGreaterThanOrEqual(4.5);
      // White button labels on the primary colour.
      expect(contrastRatio("#ffffff", c.primary), `${p.id} label on primary`).toBeGreaterThanOrEqual(4.5);
      // Hover must actually change, and get darker for a light theme.
      expect(c.primaryHover, `${p.id} hover`).not.toBe(c.primary);
      expect(relativeLuminance(c.primaryHover)).toBeLessThan(relativeLuminance(c.primary));
    }
  });

  it("keeps semantic colours light enough for white labels", () => {
    for (const p of PALETTES) {
      for (const role of ["success", "warning", "danger"] as const) {
        expect(isLight(p.colors[role]), `${p.id}.${role} is too dark for white text`).toBe(false);
      }
    }
  });

  it("looks up by id", () => {
    expect(getPalette("slate-sky")?.name).toBe("Slate + Sky");
    expect(getPalette("nope")).toBeUndefined();
  });

  it("de-duplicates across palettes", () => {
    const all = allPaletteColors();
    expect(new Set(all).size).toBe(all.length);
    // The three palettes share success/danger, so not every colour is unique.
    expect(all.length).toBeLessThan(PALETTES.length * PALETTE_ROLES.length);
    expect(all.length).toBeGreaterThan(10);
  });
});
