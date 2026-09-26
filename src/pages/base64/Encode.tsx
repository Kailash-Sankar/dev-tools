import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { toBase64 } from "@/utils/codec";

const Base64Encode = () => {
  const [value, setValue] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    try {
      setData(toBase64(value));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not encode");
    }
  };

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            <Button onClick={handleClick}>Encode</Button>
            <Button variant="outline" onClick={() => { setValue(""); setData(""); setError(null); }}>
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
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </ToolPanel>

      <ToolPanel title="Output" actions={<Button variant="outline" onClick={() => navigator.clipboard?.writeText(data)} disabled={!data}>Copy</Button>}>
        <ToolOutput empty="Encoded output appears here.">{data}</ToolOutput>
      </ToolPanel>
    </ToolLayout>
  );
};

export default Base64Encode;
