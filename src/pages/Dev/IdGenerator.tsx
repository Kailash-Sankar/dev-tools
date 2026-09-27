import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolPanel } from "@/components/tool";
import { useToast } from "@/hooks/use-toast";
import { ID_FORMATS, generateId, ulidTimestamp } from "@/utils/ids";
import type { IdFormat } from "@/utils/ids";

const BATCH_SIZES = [1, 5, 10, 25, 100];

const IdGenerator = () => {
  const { toast } = useToast();
  const [format, setFormat] = useState<IdFormat>("uuid4");
  const [count, setCount] = useState(10);
  const [ids, setIds] = useState<string[]>([]);

  const generate = useCallback(() => {
    try {
      setIds(Array.from({ length: count }, () => generateId(format)));
    } catch {
      toast({
        title: "Could not generate",
        description: "This browser blocked access to the secure random source.",
        variant: "destructive",
      });
    }
  }, [count, format, toast]);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      toast({ title: `Copied ${what}` });
    } catch {
      toast({ title: "Clipboard unavailable", variant: "destructive" });
    }
  };

  const spec = ID_FORMATS.find((f) => f.id === format);
  const firstTs = format === "ulid" && ids[0] ? ulidTimestamp(ids[0]) : null;

  return (
    <ToolLayout>
      <ToolPanel title="Options" actions={<Button onClick={generate}>Generate {count}</Button>}>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Identifier format">
          {ID_FORMATS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={format === f.id ? "default" : "outline"}
              aria-pressed={format === f.id}
              onClick={() => setFormat(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <p className="text-fg-muted text-xs">{spec?.note}</p>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="How many">
          {BATCH_SIZES.map((n) => (
            <Button
              key={n}
              size="sm"
              variant={count === n ? "default" : "outline"}
              aria-pressed={count === n}
              onClick={() => setCount(n)}
            >
              {n}
            </Button>
          ))}
        </div>

        <p className="text-fg-muted text-xs">
          Values come from <code className="font-mono">crypto.getRandomValues</code>, a
          cryptographically secure source &mdash; not{" "}
          <code className="font-mono">Math.random</code>.
        </p>

        {ids.length > 0 && (
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => copy(ids.join("\n"), "all ids")}>
              Copy all
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIds([])}>
              Clear
            </Button>
          </div>
        )}
      </ToolPanel>

      <ToolPanel title={`Generated (${ids.length})`}>
        {ids.length === 0 ? (
          <p className="text-fg-muted text-sm">Choose a format and count, then generate.</p>
        ) : (
          <ol className="flex min-h-0 flex-col gap-1 overflow-auto">
            {ids.map((id, i) => (
              <li
                key={`${id}-${i}`}
                className="bg-muted/40 flex items-center justify-between gap-2 rounded px-2 py-1"
              >
                <span className="font-mono text-xs break-all">{id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => copy(id, "id")}
                >
                  Copy
                </Button>
              </li>
            ))}
            {firstTs !== null && (
              <li className="text-fg-muted pt-1 text-xs">
                Timestamp encoded from {new Date(firstTs).toLocaleString()} (this browser&rsquo;s
                clock).
              </li>
            )}
          </ol>
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default IdGenerator;
