import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseYaml } from "./utils";

type FileUploadProps = {
  onParsed: (args: { parsedYaml: unknown }) => void;
};

function FileUpload({ onParsed }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") throw new Error("Could not read file contents.");
        onParsed({ parsedYaml: parseYaml(text) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "YAML parsing error");
      }
    };

    reader.onerror = () => setError("Could not read that file.");

    reader.readAsText(file);

    // Allow re-selecting the same file.
    event.target.value = "";
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor="yaml-upload">YAML file</Label>
      <Input id="yaml-upload" type="file" accept=".yml,.yaml,text/yaml" onChange={handleFileChange} />
      {error && (
        <p role="alert" className="text-sm text-destructive break-words">{error}</p>
      )}
    </div>
  );
}

export default FileUpload;
