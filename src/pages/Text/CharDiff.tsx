import { useState } from "react";

import { diffChars } from "diff";
import type { Change } from "diff";

import { Button } from "@/components/ui/button";
import { DiffOutput, ToolLayout, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";

const TextCharDiff = () => {
  const [valueA, setValueA] = usePersistentState("textCharA", "");
  const [valueB, setValueB] = usePersistentState("textCharB", "");
  const [data, setData] = useState<Change[]>([]);

  const handleClick = () => {
    setData(diffChars(valueA, valueB));
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
          placeholder="Paste string A"
          aria-label="Input A"
        />
        <ToolTextarea
          value={valueB}
          onChange={(e) => setValueB(e.target.value)}
          placeholder="Paste string B"
          aria-label="Input B"
        />
      </ToolPanel>

      <ToolPanel title="Output">
        <DiffOutput changes={data} empty="No differences or invalid input." />
      </ToolPanel>
    </ToolLayout>
  );
};

export default TextCharDiff;
