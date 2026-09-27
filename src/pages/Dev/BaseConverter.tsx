import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolOutput, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { BASES, BaseConvertError, bitLength, parseInBase, toAllBases } from "@/utils/base";
import type { BaseId, ConvertResult } from "@/utils/base";

/**
 * Takes the parsed bigint rather than the pre-computed record, so the
 * narrowing on `result.ok` carries the type through and nothing here can
 * be `undefined`.
 */
const BaseRows = ({ value }: { value: bigint }) => {
  const all = toAllBases(value);
  const bits = bitLength(value);

  return (
    <div className="flex min-h-0 flex-col gap-2">
      {BASES.map((b) => (
        <div key={b.id} className="shrink-0">
          <span className="text-fg-muted text-xs">
            {b.label}
            {b.prefix && <span className="font-mono"> ({b.prefix}…)</span>}
          </span>
          <ToolOutput className="mt-1">{all[b.id]}</ToolOutput>
        </div>
      ))}
      <p className="text-fg-muted shrink-0 text-xs">
        {bits} bit{bits === 1 ? "" : "s"} excluding the sign.
      </p>
    </div>
  );
};

const BaseConverter = () => {
  const [value, setValue] = usePersistentState("tool.base.value", "255");
  const [fromBase, setFromBase] = useState<BaseId>(10);

  const result = useMemo<ConvertResult>(() => {
    if (!value.trim()) return { ok: false as const, error: "" };
    try {
      return { ok: true as const, value: parseInBase(value, fromBase) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof BaseConvertError ? e.message : "Could not parse that number.",
      };
    }
  }, [value, fromBase]);

  // Narrow on result.ok, not on `all`: TypeScript can then see that
  // result.value is a bigint inside the result panel. Guarding on the
  // derived `all` renders the same output but leaves value as
  // `bigint | undefined`.
  const all = result.ok ? toAllBases(result.value) : null;

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <Button variant="outline" onClick={() => setValue("255")} disabled={value === "255"}>
            Reset
          </Button>
        }
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="255"
          className="font-mono"
          aria-label="Number to convert"
        />

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Source base">
          <span className="text-fg-muted self-center text-xs">From</span>
          {BASES.map((b) => (
            <Button
              key={b.id}
              size="sm"
              variant={fromBase === b.id ? "default" : "outline"}
              aria-pressed={fromBase === b.id}
              onClick={() => setFromBase(b.id)}
            >
              {b.label}
            </Button>
          ))}
        </div>

        {!result.ok && result.error ? (
          <p role="alert" className="text-destructive text-sm">
            {result.error}
          </p>
        ) : null}

        <p className="text-fg-muted text-xs">
          Integers only, via BigInt &mdash; values above 2<sup>53</sup> stay exact instead of
          being rounded the way JavaScript&rsquo;s <code className="font-mono">Number</code> would.
        </p>
      </ToolPanel>

      <ToolPanel
        title="Result"
        actions={
          <Button
            variant="outline"
            disabled={!all}
            onClick={() => navigator.clipboard?.writeText(all?.[fromBase] ?? "")}
          >
            Copy selected
          </Button>
        }
      >
        {result.ok ? (
          <BaseRows value={result.value} />
        ) : (
          <ToolOutput empty="All four bases appear here." />
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default BaseConverter;
