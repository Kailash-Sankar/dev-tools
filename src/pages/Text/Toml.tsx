import { useState } from "react";

import { ArrowLeftRight, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToolLayout, ToolOutput, ToolPanel, ToolTextarea } from "@/components/tool";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { TomlError, flattenToml, jsonToToml, tomlToJson } from "@/utils/toml";

type Direction = "toml-to-json" | "json-to-toml";

const SAMPLE = `# pyproject.toml
[project]
name = "my-package"
version = "1.0.0"
dependencies = ["react", "tailwindcss"]

[project.scripts]
dev = "vite"
build = "tsc -b && vite build"

[[tool.ci]]
name = "linux"
image = "ubuntu:24.04"

[[tool.ci]]
name = "macos"
image = "macos-14"
`;

const Toml = () => {
  const [direction, setDirection] = useState<Direction>("toml-to-json");
  const [input, setInput] = usePersistentState("tool.toml.value", SAMPLE);

  const isToJson = direction === "toml-to-json";

  const output = (() => {
    if (!input.trim()) return { text: "", error: null as string | null, flat: [] };
    try {
      const text = isToJson ? tomlToJson(input) : jsonToToml(input);
      const flat = isToJson
        ? flattenToml(JSON.parse(text))
        : [];
      return { text, error: null, flat };
    } catch (e) {
      return {
        text: "",
        error: e instanceof TomlError ? e.message : "Could not convert that document.",
        flat: [],
      };
    }
  })();

  const swap = () => {
    if (output.text) setInput(output.text);
    setDirection(isToJson ? "json-to-toml" : "toml-to-json");
  };

  return (
    <ToolLayout>
      <ToolPanel
        title={isToJson ? "TOML" : "JSON"}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={swap} disabled={!input}>
              <ArrowLeftRight className="size-3.5" aria-hidden />
              Swap
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)}>
              Sample
            </Button>
          </>
        }
      >
        <ToolTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isToJson ? "# key = value" : "{ }"}
          aria-label={isToJson ? "TOML input" : "JSON input"}
        />
        {output.error && (
          <p role="alert" className="text-destructive text-sm">
            {output.error}
          </p>
        )}
      </ToolPanel>

      <ToolPanel
        title={isToJson ? "JSON" : "TOML"}
        actions={
          <Button
            variant="outline"
            disabled={!output.text}
            onClick={() => navigator.clipboard?.writeText(output.text)}
          >
            Copy
          </Button>
        }
      >
        <ToolOutput empty="Converted output appears here.">{output.text}</ToolOutput>

        {output.flat.length > 0 && (
          <details className="shrink-0">
            <summary className="text-fg-muted cursor-pointer text-xs">
              Flattened keys ({output.flat.length})
            </summary>
            <ul className="mt-1 max-h-40 overflow-auto font-mono text-xs">
              {output.flat.map((f) => (
                <li key={f.path} className="flex gap-2">
                  <span className="shrink-0 break-all">{f.path}</span>
                  <span className="text-fg-muted shrink-0">{f.type}</span>
                  <span className="truncate">{f.value}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <p className="text-fg-muted flex shrink-0 items-start gap-2 text-xs">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Conversion is syntactic. Round-tripping will reformat comments away and reorder keys
            &mdash; treat the output as a starting point, not a diff.
          </span>
        </p>
      </ToolPanel>
    </ToolLayout>
  );
};

export default Toml;
