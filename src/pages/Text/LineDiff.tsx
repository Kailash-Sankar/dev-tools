import { useState } from "react";

import { diffLines } from "diff";
import type { Change } from "diff";

import { Button } from "@/components/ui/button";
import { DiffOutput, ToolLayout, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";

const TextLineDiff = () => {
  const [valueA, setValueA] = usePersistentState("textLinesA", "");
  const [valueB, setValueB] = usePersistentState("textLinesB", "");
  const [data, setData] = useState<Change[]>([]);

  const handleClick = () => {
    setData(diffLines(valueA, valueB, { ignoreWhitespace: true }));
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
          placeholder="Paste text A"
          aria-label="Input A"
        />
        <ToolTextarea
          value={valueB}
          onChange={(e) => setValueB(e.target.value)}
          placeholder="Paste text B"
          aria-label="Input B"
        />
      </ToolPanel>

      <ToolPanel title="Output">
        <DiffOutput changes={data} />
      </ToolPanel>
    </ToolLayout>
  );
};

export default TextLineDiff;
