import { useState } from "react";
import { parseYaml } from "./utils";

function FileUpload({ onParsed }) {
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsedYaml = parseYaml(text);
        onParsed({ parsedYaml });
      } catch (err) {
        setError(`YAML parsing error: ${err.message}`);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".yml,.yaml" onChange={handleFileChange} />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default FileUpload;