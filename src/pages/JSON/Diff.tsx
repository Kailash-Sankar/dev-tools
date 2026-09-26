import { useState } from "react";

import { diffJson } from "diff";
import type { Change } from "diff";

import { Button } from "@/components/ui/button";
import { DiffOutput, ToolLayout, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useToast } from "@/hooks/use-toast";

const JSONDiff = () => {
  const { toast } = useToast();
  const [valueA, setValueA] = usePersistentState("jsonDiffA", "");
  const [valueB, setValueB] = usePersistentState("jsonDiffB", "");
  const [data, setData] = useState<Change[]>([]);

  const handleClick = () => {
    // diffJson throws on invalid JSON, which previously took the whole page
    // down. Catch it and report instead.
    try {
      setData(diffJson(valueA, valueB));
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Both inputs must be valid JSON to compare.",
        variant: "destructive",
      });
    }
  };

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            <Button onClick={handleClick}>Diff</Button>
            <Button variant="outline" onClick={() => { setValueA(""); setValueB(""); setData([]); }}>
              Clear
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={valueA}
          onChange={(e) => setValueA(e.target.value)}
          placeholder="Paste JSON A"
          aria-label="Input A"
        />
        <ToolTextarea
          value={valueB}
          onChange={(e) => setValueB(e.target.value)}
          placeholder="Paste JSON B"
          aria-label="Input B"
        />
      </ToolPanel>

      <ToolPanel title="Output">
        <DiffOutput changes={data} showStrikethrough={false} />
      </ToolPanel>
    </ToolLayout>
  );
};

export default JSONDiff;
