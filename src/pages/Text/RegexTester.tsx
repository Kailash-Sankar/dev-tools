import { useMemo } from "react";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { COMMON_PATTERNS, FLAGS, RegexError, testRegex } from "@/utils/regex";

const SAMPLE_TEXT = `Contact ada@example.com or grace@example.org.
Docs at https://example.com/docs and http://localhost:3000
Built 2026-09-28, released 2027-01-15. Colour #1a2b3c and #fff.
Server 192.168.1.24 responded in 42ms.`;

const RegexTester = () => {
  const [pattern, setPattern] = usePersistentState("tool.regex.pattern", "[\\w.+-]+@[\\w-]+\\.[\\w.]+");
  const [flags, setFlags] = usePersistentState("tool.regex.flags", "gi");
  const [text, setText] = usePersistentState("tool.regex.text", SAMPLE_TEXT);

  const toggleFlag = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));

  // NOTE: this runs synchronously on the main thread. A catastrophically
  // backtracking pattern can lock the tab, and the platform offers no way to
  // cancel it. That is why the ReDoS preset is labelled and the warning below
  // is permanent rather than conditional.
  const result = useMemo(() => {
    if (!pattern) return { ok: false as const, error: null as string | null, data: null };
    try {
      return { ok: true as const, error: null, data: testRegex(pattern, text, flags) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof RegexError ? e.message : "Invalid regular expression.",
        data: null,
      };
    }
  }, [pattern, flags, text]);

  const whole = result.data?.matches.filter((m) => m.index === 0) ?? [];
  const groups = result.data?.matches.filter((m) => m.index !== 0) ?? [];

  return (
    <ToolLayout>
      <ToolPanel
        title="Pattern"
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setPattern("");
              setText("");
            }}
            disabled={!pattern && !text}
          >
            Clear
          </Button>
        }
      >
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-fg-muted">Expression</span>
          <div className="flex gap-1.5">
            <span className="bg-muted text-fg-muted flex h-9 items-center rounded-l-md border px-2 font-mono text-sm">
              /
            </span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="(\\w+)@(\\w+)"
              className="rounded-l-none font-mono"
              aria-label="Regular expression"
            />
            <span className="bg-muted text-fg-muted flex h-9 items-center rounded-r-md border px-2 font-mono text-sm">
              /{flags}
            </span>
          </div>
        </label>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Flags">
          {FLAGS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={flags.includes(f.id) ? "default" : "outline"}
              aria-pressed={flags.includes(f.id)}
              title={f.note}
              onClick={() => toggleFlag(f.id)}
              className="font-mono"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {result.error && (
          <p role="alert" className="text-destructive text-sm">
            {result.error}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {COMMON_PATTERNS.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-xs">
          <span className="text-fg-muted">Test string</span>
          <ToolTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text to match against"
            aria-label="Test string"
            maxHeight="14rem"
          />
        </label>
      </ToolPanel>

      <ToolPanel title={result.data ? `Matches (${result.data.matchCount})` : "Matches"}>
        {!result.data ? (
          <ToolOutput empty="Enter a pattern to test." />
        ) : result.data.matchCount === 0 ? (
          <p className="text-fg-muted text-sm">No matches.</p>
        ) : (
          <div className="flex min-h-0 flex-col gap-2">
            <ol className="flex flex-col gap-1 overflow-auto">
              {whole.map((m, i) => (
                <li
                  key={`${m.start}-${i}`}
                  className="bg-muted/40 flex items-baseline gap-2 rounded px-2 py-1 font-mono text-xs"
                >
                  <span className="text-fg-muted w-16 shrink-0">#{i + 1}</span>
                  <span className="min-w-0 flex-1 break-all">{m.value || "∅"}</span>
                  <span className="text-fg-muted shrink-0">
                    {m.start}–{m.end}
                  </span>
                </li>
              ))}
            </ol>

            {groups.length > 0 && (
              <div className="shrink-0">
                <h3 className="text-fg-muted mb-1 text-xs font-medium">
                  Capture groups ({groups.length})
                </h3>
                <ul className="flex max-h-40 flex-col gap-0.5 overflow-auto font-mono text-xs">
                  {groups.map((g, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-fg-muted w-16 shrink-0">
                        {g.name ? `${g.name}` : `$${g.index}`}
                      </span>
                      <span className="min-w-0 break-all">{g.value || "∅"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="text-fg-muted flex shrink-0 items-start gap-2 text-xs">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-yellow-500" aria-hidden />
          <span>
            Runs on the platform&apos;s own <code className="font-mono">RegExp</code>, so results
            match your target runtime. But JavaScript has <em>no regex timeout</em> &mdash; a
            backtracking pattern like <code className="font-mono">(a+)+$</code> against a long run
            of &ldquo;a&rdquo; will freeze this tab with no way to cancel it.
          </span>
        </p>
      </ToolPanel>
    </ToolLayout>
  );
};

export default RegexTester;
