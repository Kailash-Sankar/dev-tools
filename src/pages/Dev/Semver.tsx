import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolPanel } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import {
  BUMP_KINDS,
  SemverError,
  bumpVersion,
  compareVersions,
} from "@/utils/semver-utils";
import type { BumpKind } from "@/utils/semver-utils";

const RANGE_PRESETS = ["^1.0.0", "~1.2.0", ">=1.0.0", "1.x", "*"];

const Semver = () => {
  const [a, setA] = usePersistentState("tool.semver.a", "1.2.3");
  const [b, setB] = usePersistentState("tool.semver.b", "2.0.0");
  const [ranges, setRanges] = useState<string[]>(["^1.0.0"]);
  const [bump, setBump] = useState<BumpKind>("minor");

  const result = useMemo(() => {
    try {
      return { ok: true as const, value: compareVersions(a, b, ranges) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof SemverError ? e.message : "Could not compare those versions.",
      };
    }
  }, [a, b, ranges]);

  const bumped = useMemo(() => {
    try {
      return bumpVersion(a, bump);
    } catch {
      return null;
    }
  }, [a, bump]);

  const toggleRange = (r: string) =>
    setRanges((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  return (
    <ToolLayout>
      <ToolPanel
        title="Versions"
        actions={
          <>
            <Button variant="outline" onClick={() => { setA("1.2.3"); setB("2.0.0"); }}>
              Reset
            </Button>
          </>
        }
      >
        <div className="grid shrink-0 gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-fg-muted">A</span>
            <Input
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="1.2.3"
              className="font-mono"
              aria-label="Version A"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-fg-muted">B</span>
            <Input
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="2.0.0"
              className="font-mono"
              aria-label="Version B"
            />
          </label>
        </div>

        <div className="shrink-0">
          <span className="text-fg-muted mb-1 block text-xs">
            Check whether A satisfies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RANGE_PRESETS.map((r) => (
              <Button
                key={r}
                size="sm"
                variant={ranges.includes(r) ? "default" : "outline"}
                aria-pressed={ranges.includes(r)}
                onClick={() => toggleRange(r)}
                className="font-mono"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        {!result.ok && result.error ? (
          <p role="alert" className="text-destructive text-sm">
            {result.error}
          </p>
        ) : null}
      </ToolPanel>

      <ToolPanel title="Result">
        {result.ok ? (
          <div className="flex min-h-0 flex-col gap-3">
            <p className="text-sm">{result.value.summary}</p>

            <dl className="grid shrink-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-fg-muted">A</dt>
              <dd className="font-mono break-all">{result.value.a}</dd>
              <dt className="text-fg-muted">B</dt>
              <dd className="font-mono break-all">{result.value.b}</dd>
              <dt className="text-fg-muted">Newer</dt>
              <dd className="font-mono">
                {result.value.newer === "equal"
                  ? "neither"
                  : result.value.newer === "a"
                    ? result.value.a
                    : result.value.b}
              </dd>
              <dt className="text-fg-muted">Change</dt>
              <dd className="font-mono">{result.value.difference ?? "none"}</dd>
            </dl>

            {result.value.satisfies.length > 0 && (
              <div className="shrink-0">
                <span className="text-fg-muted mb-1 block text-xs">
                  A against {result.value.satisfies.length === 1 ? "range" : "ranges"}
                </span>
                <ul className="flex flex-col gap-0.5 text-xs">
                  {result.value.satisfies.map((s) => (
                    <li key={s.range} className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={s.ok ? "text-green-500" : "text-fg-muted/50"}
                      >
                        {s.ok ? "✓" : "✗"}
                      </span>
                      <span className="font-mono">{s.range}</span>
                      <span className="text-fg-muted">{s.ok ? "satisfied" : "not satisfied"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="shrink-0 border-t pt-3">
              <span className="text-fg-muted mb-1 block text-xs">Bump A by</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {BUMP_KINDS.map((k) => (
                    <Button
                      key={k}
                      size="sm"
                      variant={bump === k ? "default" : "outline"}
                      aria-pressed={bump === k}
                      onClick={() => setBump(k)}
                      className="font-mono"
                    >
                      {k}
                    </Button>
                  ))}
                </div>
                <span aria-hidden className="text-fg-muted text-sm">→</span>
                <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
                  {bumped ?? "—"}
                </code>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-fg-muted text-sm">Enter two versions to compare.</p>
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default Semver;
