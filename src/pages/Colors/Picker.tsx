import { useMemo, useState } from "react";

import { ToolLayout, ToolOutput, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { contrastRatio, hexToRgb, isLight, normalizeHex, rgbToHsl } from "@/utils/color";
import { PALETTES, PALETTE_ROLES } from "@/utils/palettes";

const SWATCHES = [
  "#000000", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8", "#ffffff",
  "#dc2626", "#ea580c", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#78350f",
];

const fmt = (n: number) => Math.round(n).toString().padStart(3, " ");

const Picker = () => {
  const [stored, setStored] = usePersistentState("colorPicker", "#FFA500");
  const [draft, setDraft] = useState<string | null>(null);
  const [paletteId, setPaletteId] = usePersistentState("colorPicker.palette", PALETTES[0].id);

  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];

  const hex = (draft ?? stored).toLowerCase();
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);

  const commit = (value: string) => {
    const next = normalizeHex(value);
    if (next) setStored(next);
  };

  return (
    <ToolLayout>
      <ToolPanel title="Picker">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Colour</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => setStored(e.target.value.toLowerCase())}
                className="h-12 w-16 cursor-pointer rounded-md border bg-transparent p-1"
                aria-label="Colour picker"
              />
              <input
                type="text"
                value={hex}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={(e) => { commit(e.target.value); setDraft(null); }}
                spellCheck={false}
                aria-label="Hex value"
                className="h-12 w-full rounded-md border border-input bg-transparent px-3 font-mono text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Swatches</span>
            <div className="grid grid-cols-8 gap-1.5">
              {SWATCHES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStored(s)}
                  style={{ backgroundColor: s }}
                  aria-label={`Use ${s}`}
                  className={`h-6 w-full rounded border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${s === hex ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Example site palettes</span>

            <div role="tablist" aria-label="Example site palettes" className="flex flex-wrap gap-1.5">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={p.id === palette.id}
                  onClick={() => setPaletteId(p.id)}
                  className={`rounded-md border px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    p.id === palette.id
                      ? "border-accent-strong bg-surface-2 text-foreground"
                      : "text-fg-muted hover:bg-surface-2"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <p className="text-fg-subtle text-xs">{palette.note}</p>

            <ul className="mt-0.5 flex flex-col gap-1">
              {PALETTE_ROLES.map(({ role, label }) => {
                const value = palette.colors[role];
                // Ratio of the best of white/black text, which is what you
                // would actually put on this swatch.
                const vsWhite = contrastRatio(value, "#ffffff");
                const vsBlack = contrastRatio(value, "#000000");
                const best = Math.max(vsWhite, vsBlack);
                const passes = best >= 4.5;
                return (
                  <li key={role}>
                    <button
                      type="button"
                      onClick={() => setStored(value)}
                      title={`${label} — ${value}`}
                      className={`flex w-full items-center gap-2 rounded-md border px-1.5 py-1 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        value === hex ? "ring-1 ring-ring" : "border-transparent"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 rounded border"
                        style={{ backgroundColor: value }}
                      />
                      <span className="text-fg-muted min-w-0 flex-1 truncate text-xs">{label}</span>
                      <span className="text-fg-subtle font-mono text-[10px]">{value}</span>
                      <span
                        className={`w-9 shrink-0 text-right font-mono text-[10px] ${
                          passes ? "text-fg-muted" : "text-destructive"
                        }`}
                        title={`Best text contrast ${best.toFixed(2)}:1 (AA needs 4.5:1)`}
                      >
                        {best.toFixed(1)}:1
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="text-fg-subtle text-[11px]">
              The right-hand figure is the best contrast available for text on that
              swatch, against WCAG AA (4.5:1). Click any row to load it.
            </p>
          </div>
        </div>
      </ToolPanel>

      <ToolPanel
        title="Output"
        actions={
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(hex)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Copy hex
          </button>
        }
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-md border p-6 font-mono text-2xl font-bold"
          style={{ backgroundColor: hex, color: isLight(hex) ? "#000" : "#fff" }}
        >
          {hex}
        </div>

        <ToolOutput className="shrink-0">
          {`hex   ${hex}
rgb   rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})
hsl   hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`}
        </ToolOutput>

        <div className="grid shrink-0 grid-cols-3 gap-2 font-mono text-xs">
          {(["r", "g", "b"] as const).map((k) => (
            <div key={k} className="rounded border p-2 text-center">
              <div className="text-muted-foreground uppercase">{k}</div>
              <div>{fmt(rgb[k])}</div>
            </div>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
};

export default Picker;
