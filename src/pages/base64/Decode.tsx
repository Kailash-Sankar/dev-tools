import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { fromBase64 } from "@/utils/codec";

const Base64Decode = () => {
  const [value, setValue] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    try {
      setData(fromBase64(value));
      setError(null);
    } catch (e) {
      setData("");
      setError(e instanceof Error ? e.message : "Could not decode");
    }
  };

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            <Button onClick={handleClick}>Decode</Button>
            <Button variant="outline" onClick={() => { setValue(""); setData(""); setError(null); }}>
              Clear
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste base64 to decode"
          aria-label="Input"
        />
        {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
      </ToolPanel>

      <ToolPanel title="Output" actions={<Button variant="outline" onClick={() => navigator.clipboard?.writeText(data)} disabled={!data}>Copy</Button>}>
        <ToolOutput empty="Decoded output appears here.">{data}</ToolOutput>
      </ToolPanel>
    </ToolLayout>
  );
};

export default Base64Decode;
