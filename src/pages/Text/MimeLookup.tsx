import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolOutput, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { COMMON_TYPES, describe, lookupExtension, lookupType } from "@/utils/mime";
import type { MimeDirection } from "@/utils/mime";

const MimeLookup = () => {
  const [value, setValue] = usePersistentState("tool.mime.value", "webp");
  const [direction, setDirection] = useState<MimeDirection>("extension");

  const result = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return { ok: false as const, found: null, error: null as string | null };
    const found = direction === "extension" ? lookupExtension(trimmed) : lookupType(trimmed);
    if (found) return { ok: true as const, found, error: null };
    return {
      ok: false as const,
      found: null,
      error:
        direction === "extension"
          ? `No MIME type is registered for extension "${trimmed}".`
          : `"${trimmed}" is not a recognised MIME type.`,
    };
  }, [value, direction]);

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setDirection(direction === "extension" ? "type" : "extension");
              setValue(direction === "extension" ? "image/webp" : "webp");
            }}
          >
            Flip direction
          </Button>
        }
      >
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lookup direction">
          <Button
            size="sm"
            variant={direction === "extension" ? "default" : "outline"}
            aria-pressed={direction === "extension"}
            onClick={() => setDirection("extension")}
          >
            Extension &rarr; type
          </Button>
          <Button
            size="sm"
            variant={direction === "type" ? "default" : "outline"}
            aria-pressed={direction === "type"}
            onClick={() => setDirection("type")}
          >
            Type &rarr; extension
          </Button>
        </div>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={direction === "extension" ? "webp" : "image/webp"}
          className="font-mono"
          aria-label="Value to look up"
        />

        {result.error && (
          <p role="alert" className="text-destructive text-sm">
            {result.error}
          </p>
        )}

        {direction === "extension" && (
          <div className="flex flex-wrap gap-1">
            {COMMON_TYPES.map((t) => (
              <Button
                key={t}
                size="sm"
                variant="ghost"
                className="h-6 font-mono text-xs"
                onClick={() => setValue(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        )}
      </ToolPanel>

      <ToolPanel
        title="Result"
        actions={
          <Button
            variant="outline"
            disabled={!result.found}
            onClick={() => navigator.clipboard?.writeText(result.found ?? "")}
          >
            Copy
          </Button>
        }
      >
        {result.found ? (
          <div className="flex min-h-0 flex-col gap-2">
            <ToolOutput className="shrink-0">{result.found}</ToolOutput>
            <dl className="grid shrink-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-fg-muted">Direction</dt>
              <dd>{direction === "extension" ? "Extension to type" : "Type to extension"}</dd>
              <dt className="text-fg-muted">Round trip</dt>
              <dd className="font-mono break-all">
                {(() => {
                  const back =
                    direction === "extension" ? lookupType(result.found) : lookupExtension(result.found);
                  return back ?? "—";
                })()}
              </dd>
              {result.found.includes("/") && (
                <>
                  <dt className="text-fg-muted">Charset</dt>
                  <dd className="font-mono">{describe(result.found) ?? "—"}</dd>
                </>
              )}
            </dl>
          </div>
        ) : (
          <ToolOutput empty="The result appears here." />
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default MimeLookup;
