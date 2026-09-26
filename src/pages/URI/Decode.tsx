import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { uriDecode } from "@/utils/codec";

const URIDecode = () => {
  const [value, setValue] = useState("");
  const [data, setData] = useState("");

  const handleClick = () => setData(uriDecode(value));

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            <Button onClick={handleClick}>Decode</Button>
            <Button variant="outline" onClick={() => { setValue(""); setData(""); }}>
              Clear
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste percent-encoded string to decode"
          aria-label="Input"
        />
      </ToolPanel>

      <ToolPanel title="Output" actions={<Button variant="outline" onClick={() => navigator.clipboard?.writeText(data)} disabled={!data}>Copy</Button>}>
        <ToolOutput empty="Decoded output appears here.">{data}</ToolOutput>
      </ToolPanel>
    </ToolLayout>
  );
};

export default URIDecode;
