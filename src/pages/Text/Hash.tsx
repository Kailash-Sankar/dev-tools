import { useEffect, useMemo, useState } from "react";

import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { HASH_ALGORITHMS, hashAll, isSubtleCryptoAvailable } from "@/utils/hash";
import type { HashAlgorithm } from "@/utils/hash";

const PLACEHOLDER = "Paste the text to hash";

const Hash = () => {
  const [value, setValue] = usePersistentState("tool.hash.value", "");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [digests, setDigests] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // crypto.subtle only exists in a secure context (https, or localhost).
  const subtleAvailable = useMemo(isSubtleCryptoAvailable, []);

  // Re-hash whenever the input or the selected algorithm changes. Async
  // results are guarded against arriving out of order.
  useEffect(() => {
    if (!subtleAvailable || value === "") {
      setDigests(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setError(null);

    hashAll(value)
      .then((all) => {
        if (!cancelled) setDigests(all);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setDigests(null);
          setError(e instanceof Error ? e.message : "Could not hash the input.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, subtleAvailable]);

  const selected = digests?.[algorithm] ?? "";

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <Button variant="outline" onClick={() => setValue("")} disabled={!value}>
            Clear
          </Button>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDER}
          aria-label={PLACEHOLDER}
        />

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Hash algorithm">
          {HASH_ALGORITHMS.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant={algorithm === a.id ? "default" : "outline"}
              aria-pressed={algorithm === a.id}
              onClick={() => setAlgorithm(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
        <p className="text-fg-muted text-xs">
          {HASH_ALGORITHMS.find((a) => a.id === algorithm)?.note}
        </p>

        {!subtleAvailable && (
          <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <code className="font-mono">crypto.subtle</code> is unavailable, so hashing is
              disabled. Browsers only expose it in a secure context &mdash; serve this app over
              https or from <code className="font-mono">localhost</code>.
            </span>
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </ToolPanel>

      <ToolPanel
        title={`${algorithm} digest`}
        actions={
          <Button
            variant="outline"
            disabled={!selected}
            onClick={() => navigator.clipboard?.writeText(selected)}
          >
            Copy
          </Button>
        }
      >
        <ToolOutput empty="Digests appear here.">{selected}</ToolOutput>

        {digests && (
          <dl className="grid shrink-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            {HASH_ALGORITHMS.map((a) => (
              <div key={a.id} className="contents">
                <dt className="text-fg-muted font-mono">{a.label}</dt>
                <dd className="truncate font-mono" title={digests[a.id]}>
                  {digests[a.id]}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="text-fg-muted flex shrink-0 items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            MD5 and SHA-1 are shown for compatibility only. Both are broken for collision
            resistance &mdash; never use them for signatures, integrity or passwords.
          </span>
        </p>
      </ToolPanel>
    </ToolLayout>
  );
};

export default Hash;
