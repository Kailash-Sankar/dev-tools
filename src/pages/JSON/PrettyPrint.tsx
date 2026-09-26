import { useState } from "react";

import { JsonView, darkStyles, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { useTheme } from "@/components/theme-provider";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";

const JSONPrettyPrint = () => {
  const { theme } = useTheme();
  const [value, setValue] = usePersistentState("jsonPrettyPrintIn");
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark";

  const handleClick = () => {
    try {
      setData(JSON.parse(value));
      setError(null);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <ToolLayout>
      <ToolPanel
        title="Input"
        actions={
          <>
            <Button onClick={handleClick}>Format</Button>
            <Button variant="outline" onClick={() => { setValue(""); setData(null); setError(null); }}>
              Clear
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          placeholder="Paste JSON here"
          aria-label="Input"
        />
        {error && (
          <p role="alert" className="shrink-0 text-sm text-destructive break-words">
            {error}
          </p>
        )}
      </ToolPanel>

      <ToolPanel
        title="Output"
        contentClassName="p-0"
      >
        {data === null ? (
          <p className="p-2.5 text-sm text-muted-foreground">Formatted JSON appears here.</p>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto p-2.5">
            <JsonView
              data={data as object}
              style={isDark ? darkStyles : defaultStyles}
              clickToExpandNode
            />
          </div>
        )}
      </ToolPanel>
    </ToolLayout>
  );
};

export default JSONPrettyPrint;
