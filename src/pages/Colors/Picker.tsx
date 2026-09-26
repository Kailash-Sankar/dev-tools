import { useMemo, useState } from "react";

import { ToolLayout, ToolOutput, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { hexToRgb, isLight, normalizeHex, rgbToHsl } from "@/utils/color";

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
