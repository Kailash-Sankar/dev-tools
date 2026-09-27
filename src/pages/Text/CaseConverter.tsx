import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { CASE_FORMATS, convertCase } from "@/utils/case";
import type { CaseFormatId } from "@/utils/case";

const CaseConverter = () => {
  const [value, setValue] = usePersistentState("tool.case.value", "user first name");
  const [copied, setCopied] = useState<CaseFormatId | null>(null);

  // Pasting is the whole interaction, so this recomputes on every keystroke.
  const results = useMemo(
    () => CASE_FORMATS.map((f) => ({ id: f.id, label: f.label, out: convertCase(value, f.id) })),
    [value]
  );

  const copy = async (id: CaseFormatId, text: string) => {
    await navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  };

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <Button variant="outline" onClick={() => setValue("user first name")} disabled={!value}>
            Clear
          </Button>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="user first name"
          aria-label="Text to convert"
        />
        <p className="text-fg-muted text-xs">
          Splits existing identifiers correctly, so <code className="font-mono">userID</code> and{" "}
          <code className="font-mono">HTTPServer</code> do not turn into letter-by-letter soup.
        </p>
      </ToolPanel>

      <ToolPanel title="Result" actions={
        <Button
          variant="outline"
          disabled={!value}
          onClick={() => navigator.clipboard?.writeText(results.map((r) => r.out).join("\n"))}
        >
          Copy all
        </Button>
      }>
        <div className="flex min-h-0 flex-col gap-1 overflow-auto">
          {results.map((r) => (
            <div
              key={r.id}
              className="hover:bg-muted/40 flex items-center gap-2 rounded px-2 py-1.5"
            >
              <span className="text-fg-muted w-36 shrink-0 font-mono text-xs">{r.label}</span>
              <code className="min-w-0 flex-1 font-mono text-sm break-all">
                {r.out || <span className="text-fg-muted/50">&mdash;</span>}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => copy(r.id, r.out)}
              >
                {copied === r.id ? "Copied" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
};

export default CaseConverter;
