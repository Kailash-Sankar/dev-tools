// @vitest-environment jsdom
/**
 * Route smoke tests.
 *
 * Deliberately shallow: each tool page is mounted and we assert that some
 * text unique to that page appears. This is a "is the app broken?" canary,
 * not a specification of behaviour -- the pure logic is covered by the unit
 * tests in src/utils.
 *
 * Two things this file has to get right:
 *
 *  1. Every route in App.tsx is `lazy()`. A synchronous assertion right after
 *     render() only ever sees the <Suspense> skeleton, so the test would pass
 *     even if the page itself threw on mount. Every assertion here is
 *     therefore awaited with findBy*, which only resolves once the lazy chunk
 *     has loaded and the real page has rendered.
 *
 *  2. The expected strings come from toolList, so adding a tool to the config
 *     without a matching expectation fails loudly rather than silently
 *     skipping.
 *
 * Out of scope: WebGL/canvas rendering, file pickers, clipboard and layout.
 * Those only misbehave in a real browser and were verified with headless
 * Chrome.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import App from "@/App";
import { toolList } from "@/layout/toolConfig";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPaletteProvider } from "@/components/command-palette-context";

// jsdom has no WebGL. These are only constructed on user action, but the
// modules are imported eagerly by their routes.
vi.mock("sigma", () => ({
  default: class {
    kill() {}
    on() {}
    refresh() {}
  },
}));
vi.mock("pica", () => ({
  default: () => ({ resize: async () => {}, toBlob: async () => new Blob() }),
}));

/**
 * A marker unique to each page, used to prove the lazy chunk loaded and the
 * page rendered. `placeholder` markers are matched against the placeholder
 * attribute (not text content), which is what most tool inputs use.
 */
type Marker = { kind: "text" | "placeholder"; match: RegExp };

const EXPECTED: Record<string, Marker> = {
  "/json-pp":         { kind: "placeholder", match: /Paste JSON here/i },
  "/json-diff":       { kind: "placeholder", match: /Paste JSON A/i },
  "/b64-encode":      { kind: "placeholder", match: /Paste string to encode/i },
  "/b64-decode":      { kind: "placeholder", match: /Paste base64 to decode/i },
  "/uri-encode":      { kind: "placeholder", match: /Paste string to encode/i },
  "/uri-decode":      { kind: "placeholder", match: /percent-encoded/i },
  "/txt-diff-line":   { kind: "placeholder", match: /Paste text A/i },
  "/txt-diff-char":   { kind: "placeholder", match: /Paste string A/i },
  "/date-tz":         { kind: "text", match: /Input Date/i },
  "/date-epoch":      { kind: "text", match: /Epoch/i },
  "/color-picker":    { kind: "text", match: /Swatches/i },
  "/img-compressor":  { kind: "text", match: /Upload image/i },
  "/yaml-viz":        { kind: "text", match: /Render Mock/i },
  "/todo-list":       { kind: "text", match: /Todo List/i },
};

// `timeout` is a waitFor option, so it goes in the third argument rather than
// being merged into the matcher options.
const WAIT = { timeout: 10_000 };

async function findMarker(marker: Marker) {
  return marker.kind === "placeholder"
    ? screen.findByPlaceholderText(marker.match, undefined, WAIT)
    : screen.findByText(marker.match, undefined, WAIT);
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});

/** Mirrors the provider nesting in main.tsx. */
function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <CommandPaletteProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </MemoryRouter>
      </CommandPaletteProvider>
    </ThemeProvider>
  );
}

describe("route smoke tests", () => {
  it("renders the home page", async () => {
    renderAt("/");
    expect(await screen.findByText(/no API calls/i)).toBeTruthy();
  });

  it.each(toolList.map((t) => [t.title, t.url] as const))(
    "mounts %s at %s",
    async (_title, url) => {
      const marker = EXPECTED[url];
      // A new tool with no expectation here would silently not be covered.
      expect(
        marker,
        `No marker registered for ${url} -- add one to EXPECTED`
      ).toBeDefined();

      renderAt(url);
      // Awaited: the route is lazy(), so this only resolves once the real
      // page has mounted. A sync assertion would pass on the skeleton alone.
      expect(await findMarker(marker!)).toBeTruthy();
    }
  );
});

describe("tool list integrity", () => {
  it("has no duplicate urls", () => {
    const urls = toolList.map((t) => t.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("only uses absolute paths", () => {
    for (const t of toolList) {
      expect(t.url.startsWith("/")).toBe(true);
    }
  });

  it("has a smoke-test marker for every tool", () => {
    for (const t of toolList) {
      expect(EXPECTED[t.url], `missing marker for ${t.url}`).toBeDefined();
    }
  });
});
