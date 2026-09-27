import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The pre-paint theme script in index.html has to agree with the React theme
 * provider, but HTML can't import from the module graph, so the logic is
 * duplicated. These assertions are the only thing keeping the two in sync.
 */
const STORAGE_KEY = "vite-ui-theme";

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
const provider = readFileSync(
  join(__dirname, "components", "theme-provider.tsx"),
  "utf8"
);

describe("pre-paint theme script", () => {
  it("uses the same localStorage key as the provider", () => {
    expect(provider).toContain(`STORAGE_KEY = "${STORAGE_KEY}"`);
    expect(html).toContain(`localStorage.getItem("${STORAGE_KEY}")`);
  });

  it("runs before the app bundle", () => {
    const scriptIdx = html.indexOf("prefers-color-scheme");
    const moduleIdx = html.indexOf('type="module"');
    expect(scriptIdx).toBeGreaterThan(-1);
    expect(scriptIdx).toBeLessThan(moduleIdx);
  });

  it("applies the same class names", () => {
    const script = html.slice(html.indexOf("<script>"), html.indexOf("</script>"));
    expect(script).toMatch(/classList\.add\(d\s*\?\s*["']dark["']\s*:\s*["']light["']\)/);
    expect(provider).toContain("classList.add(resolvedTheme)");
    expect(provider).toContain("addEventListener(\"change\"");
  });
});
