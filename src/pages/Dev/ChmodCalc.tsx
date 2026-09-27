import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolOutput, ToolPanel } from "@/components/tool";
import { ChmodError, PERMISSION_GROUPS, SPECIAL_BITS, fromOctal, toOctal, toSymbolic } from "@/utils/chmod";
import type { PermissionGroupId, PermissionTriplet } from "@/utils/chmod";

const PERMS: { id: 0 | 1 | 2; label: string }[] = [
  { id: 0, label: "Read" },
  { id: 1, label: "Write" },
  { id: 2, label: "Execute" },
];

const PRESETS = [
  { label: "644", value: "644" },
  { label: "755", value: "755" },
  { label: "600", value: "600" },
  { label: "777", value: "777" },
  { label: "4755", value: "4755" },
  { label: "1777", value: "1777" },
];

const ChmodCalc = () => {
  const [input, setInput] = useState("755");
  const [specials, setSpecials] = useState<string[]>([]);
  const [isDir, setIsDir] = useState(true);

  // A malformed input keeps the last good state rather than blanking the UI,
  // so a half-typed "47" doesn't make everything disappear.
  const { perms, message } = (() => {
    try {
      return { perms: fromOctal(input), message: null as string | null };
    } catch (e) {
      return {
        perms: null,
        message: e instanceof ChmodError ? e.message : "Could not read that mode.",
      };
    }
  })();
  const octal = perms ? toOctal(perms, specials) : "";
  const symbolic = perms ? toSymbolic(perms, isDir) : "";

  const toggle = (g: PermissionGroupId, i: 0 | 1 | 2) => {
    if (!perms) return;
    const next: PermissionTriplet = [...perms[g]] as PermissionTriplet;
    next[i] = !next[i];
    setInput(toOctal({ ...perms, [g]: next }, specials));
  };

  return (
    <ToolLayout>
      <ToolPanel title="Mode" actions={
        <Button variant="outline" onClick={() => { setInput("755"); setSpecials([]); }}>
          Reset
        </Button>
      }>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="755"
          inputMode="numeric"
          className="font-mono"
          aria-label="Octal mode"
        />
        {message && <p role="alert" className="text-destructive text-sm">{message}</p>}

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={input === p.value ? "default" : "outline"}
              aria-pressed={input === p.value}
              onClick={() => setInput(p.value)}
              className="font-mono"
            >
              {p.label}
            </Button>
          ))}
        </div>

        <table className="w-full shrink-0 text-xs">
          <caption className="sr-only">Permission bits</caption>
          <thead>
            <tr className="text-fg-muted">
              <th scope="col" className="text-left font-normal">Group</th>
              {PERMS.map((p) => (
                <th key={p.id} scope="col" className="font-normal">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((g) => (
              <tr key={g.id}>
                <th scope="row" className="text-left font-normal">{g.label}</th>
                {PERMS.map((p) => {
                  const on = perms ? perms[g.id][p.id] : false;
                  return (
                    <td key={p.id}>
                      <Button
                        size="icon"
                        variant={on ? "default" : "outline"}
                        aria-pressed={on}
                        aria-label={`${g.label} ${p.label}`}
                        disabled={!perms}
                        onClick={() => toggle(g.id, p.id)}
                        className="size-8 font-mono"
                      >
                        {p.id === 0 ? "r" : p.id === 1 ? "w" : "x"}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="shrink-0">
          <span className="text-fg-muted mb-1 block text-xs">Special bits</span>
          <div className="flex flex-col gap-1">
            {SPECIAL_BITS.map((s) => (
              <label key={s.id} className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={specials.includes(s.id)}
                  onChange={(e) =>
                    setSpecials((prev) =>
                      e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id)
                    )
                  }
                />
                <span>
                  <code className="font-mono">{s.label}</code> &mdash; {s.note}
                </span>
              </label>
            ))}
          </div>
        </div>
      </ToolPanel>

      <ToolPanel title="Result" actions={
        <Button variant="outline" disabled={!octal} onClick={() => navigator.clipboard?.writeText(`chmod ${octal}`)}>
          Copy command
        </Button>
      }>
        {octal ? (
          <div className="flex min-h-0 flex-col gap-2">
            <ToolOutput className="shrink-0">{`chmod ${octal} file`}</ToolOutput>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={isDir}
                  onChange={(e) => setIsDir(e.target.checked)}
                />
                treat as a directory
              </label>
              <span className="text-fg-muted font-mono text-sm">{symbolic}</span>
            </div>
          </div>
        ) : (
          <ToolOutput empty="Octal and symbolic forms appear here." />
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default ChmodCalc;
