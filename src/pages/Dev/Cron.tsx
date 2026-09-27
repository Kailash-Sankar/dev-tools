import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import {
  CRON_PRESETS,
  CronError,
  describeCron,
  formatRelative,
  formatRunTime,
} from "@/utils/cron";

const FIELD_HELP: { field: string; meaning: string }[] = [
  { field: "minute", meaning: "0-59" },
  { field: "hour", meaning: "0-23" },
  { field: "day of month", meaning: "1-31" },
  { field: "month", meaning: "1-12 or JAN-DEC" },
  { field: "day of week", meaning: "0-6 or SUN-SAT (0 and 7 are both Sunday)" },
];

const Cron = () => {
  const [expression, setExpression] = usePersistentState("tool.cron.value", "0 9 * * 1-5");

  const result = useMemo(() => {
    if (!expression.trim()) return { ok: false as const, error: "" };
    try {
      return { ok: true as const, value: describeCron(expression) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof CronError ? e.message : "Could not parse that expression.",
      };
    }
  }, [expression]);

  return (
    <ToolLayout>
      <ToolPanel
        title="Expression"
        actions={
          <Button
            variant="outline"
            onClick={() => setExpression("0 9 * * 1-5")}
            disabled={expression === "0 9 * * 1-5"}
          >
            Reset
          </Button>
        }
      >
        <Input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="0 9 * * 1-5"
          className="font-mono"
          aria-label="Cron expression"
        />

        <div className="shrink-0">
          <span className="text-fg-muted mb-1 block text-xs">Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {CRON_PRESETS.map((p) => (
              <Button
                key={p.expression}
                size="sm"
                variant={expression === p.expression ? "default" : "outline"}
                aria-pressed={expression === p.expression}
                onClick={() => setExpression(p.expression)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {!result.ok && result.error ? (
          <p role="alert" className="text-destructive text-sm">
            {result.error}
          </p>
        ) : null}

        <dl className="grid shrink-0 grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
          {FIELD_HELP.map((f) => (
            <div key={f.field} className="contents">
              <dt className="text-fg-muted">{f.field}</dt>
              <dd className="font-mono break-all">{f.meaning}</dd>
            </div>
          ))}
        </dl>
      </ToolPanel>

      <ToolPanel title="Explanation">
        {result.ok ? (
          <div className="flex min-h-0 flex-col gap-3">
            <p className="text-sm">{result.value.description}</p>

            <div className="shrink-0">
              <h3 className="text-fg-muted mb-1.5 text-xs font-medium">
                Next {result.value.next.length} runs
              </h3>
              <ol className="flex flex-col gap-1.5">
                {result.value.next.map((d, i) => (
                  <li
                    key={d.getTime()}
                    className="bg-muted/40 flex flex-wrap items-baseline justify-between gap-2 rounded px-2 py-1 text-xs"
                  >
                    <span className="font-mono">{formatRunTime(d)}</span>
                    <span className="text-fg-muted">
                      {i === 0 ? formatRelative(d) : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-fg-muted shrink-0 text-xs">
              Times are shown in <span className="font-mono">{result.value.timeZone}</span>, this
              browser&rsquo;s local zone. Cron is always evaluated in the scheduler&rsquo;s zone, so
              check that before assuming these match production.
            </p>
          </div>
        ) : (
          <p className="text-fg-muted text-sm">
            Enter a 5-field cron expression to see what it means.
          </p>
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default Cron;
