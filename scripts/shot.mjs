/**
 * Screenshot helper for visual review.
 *
 * Usage:
 *   node scripts/shot.mjs <path> <out.png> [theme] [width] [height] [evalFile]
 *
 * theme: "light" | "dark" | "system"  (default: system)
 *
 * Emulates prefers-color-scheme so both themes can be reviewed without
 * touching OS settings. Requires `pnpm preview` to be running.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [
  , , path = "/", out = "/tmp/shot.png", theme = "system", w = "1440", h = "900",
  evalFile,
] = process.argv;

const CHROME = process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9222 + Math.floor(Math.random() * 400);
const base = process.env.PREVIEW_URL ?? "http://localhost:4173";
const profile = mkdtempSync(join(tmpdir(), "shot-"));

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
  "--enable-unsafe-swiftshader", "--hide-scrollbars",
  `--user-data-dir=${profile}`, `--window-size=${w},${h}`,
  `--remote-debugging-port=${PORT}`, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 80; i++) {
  try {
    const j = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = j.find((t) => t.type === "page");
    if (target) break;
  } catch {}
  await sleep(250);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: Number(w), height: Number(h), deviceScaleFactor: 2, mobile: false,
});
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: theme === "system" ? "no-preference" : theme }],
});

await send("Page.navigate", { url: base + path });
await sleep(2600);

// Optional script to run in the page before capturing (e.g. open the palette).
if (evalFile) {
  const { readFileSync } = await import("node:fs");
  const r = await send("Runtime.evaluate", {
    expression: readFileSync(evalFile, "utf8"),
    awaitPromise: true,
  });
  if (r.exceptionDetails) {
    console.error("eval failed:", JSON.stringify(r.exceptionDetails.exception?.description));
  }
  await sleep(1200);
}

const { data } = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(out, Buffer.from(data, "base64"));
console.log(`${out}  (${path}, ${theme}, ${w}x${h})`);

ws.close();
chrome.kill();
process.exit(0);
