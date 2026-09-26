import { describe, expect, it } from "vitest";

import {
  hexToRgb,
  hslToRgb,
  isLight,
  normalizeHex,
  rgbToHex,
  rgbToHsl,
} from "./color";

const round = (n: number) => Math.round(n);

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("expands 3-digit shorthand", () => {
    expect(hexToRgb("#f80")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("tolerates a missing leading hash", () => {
    expect(hexToRgb("ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("falls back to black on malformed input", () => {
    expect(hexToRgb("#zzzzzz")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("rgbToHex", () => {
  it("pads single-digit channels", () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
  });

  it("clamps out-of-range channels", () => {
    expect(rgbToHex({ r: -20, g: 300, b: 128 })).toBe("#00ff80");
  });

  it("round-trips", () => {
    expect(rgbToHex(hexToRgb("#3a7bd5"))).toBe("#3a7bd5");
  });
});

describe("rgbToHsl / hslToRgb", () => {
  it("converts primary hues", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toMatchObject({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toMatchObject({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toMatchObject({ h: 240, s: 100, l: 50 });
  });

  it("reports greys as unsaturated", () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toMatchObject({ s: 0 });
  });

  it("converts hsl back to the same primaries", () => {
    for (const h of [0, 120, 240]) {
      const rgb = hslToRgb({ h, s: 100, l: 50 });
      expect({ r: round(rgb.r), g: round(rgb.g), b: round(rgb.b) }).toEqual(
        h === 0 ? { r: 255, g: 0, b: 0 } : h === 120 ? { r: 0, g: 255, b: 0 } : { r: 0, g: 0, b: 255 }
      );
    }
  });

  it("wraps hue outside 0-360", () => {
    const a = hslToRgb({ h: 360, s: 100, l: 50 });
    const b = hslToRgb({ h: 0, s: 100, l: 50 });
    expect(round(a.r)).toBe(round(b.r));
    expect(round(a.g)).toBe(round(b.g));
    expect(round(a.b)).toBe(round(b.b));
  });

  it("survives a full rgb->hsl->rgb round trip", () => {
    for (let i = 0; i < 200; i++) {
      const rgb = { r: (i * 37) % 256, g: (i * 91) % 256, b: (i * 173) % 256 };
      const back = hslToRgb(rgbToHsl(rgb));
      expect(Math.abs(round(back.r) - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(round(back.g) - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(round(back.b) - rgb.b)).toBeLessThanOrEqual(1);
    }
  });
});

describe("normalizeHex", () => {
  it("lowercases and adds the hash", () => {
    expect(normalizeHex("F80")).toBe("#ff8800");
    expect(normalizeHex("#AABBCC")).toBe("#aabbcc");
  });

  it("returns empty string for invalid input", () => {
    expect(normalizeHex("zzz")).toBe("");
    expect(normalizeHex("#12345")).toBe("");
  });
});

describe("isLight", () => {
  it("classifies extremes", () => {
    expect(isLight("#ffffff")).toBe(true);
    expect(isLight("#000000")).toBe(false);
  });

  it("classifies mid tones so text stays readable", () => {
    expect(isLight("#ffa500")).toBe(true);
    expect(isLight("#000080")).toBe(false);
  });
});
