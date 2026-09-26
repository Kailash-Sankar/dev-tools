import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { uriEncode } from "@/utils/codec";

const URIEncode = () => {
  const [value, setValue] = useState("");
  const [data, setData] = useState("");

  const handleClick = () => setData(uriEncode(value));

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            <Button onClick={handleClick}>Encode</Button>
            <Button variant="outline" onClick={() => { setValue(""); setData(""); }}>
              Clear
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste string to encode"
          aria-label="Input"
        />
      </ToolPanel>

      <ToolPanel title="Output" actions={<Button variant="outline" onClick={() => navigator.clipboard?.writeText(data)} disabled={!data}>Copy</Button>}>
        <ToolOutput empty="Encoded output appears here.">{data}</ToolOutput>
      </ToolPanel>
    </ToolLayout>
  );
};

export default URIEncode;
