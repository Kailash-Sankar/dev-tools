export type Tool = {
  title: string;
  url: string;
  /** Sidebar group + palette grouping. Optional; ungrouped tools go to "Other". */
  group?: ToolGroup;
  /** Extra words the command palette matches on (e.g. "b64" -> base64). */
  keywords?: string[];
  /** Single-character shortcut, shown in the palette. Avoid conflicts. */
  shortcut?: string;
};

export type ToolGroup = "Text" | "Encoding" | "Dev" | "Convert" | "Other";

/**
 * Single source of truth for navigation, the command palette and the sidebar.
 * Adding a tool here plus a route in App.tsx is all that's required; the
 * smoke test fails if a tool is added here without a marker.
 */
export const toolList: Tool[] = [
  { title: "JSON Format",  url: "/json-pp",     group: "Text",     keywords: ["beautify", "pretty", "parse"], shortcut: "1" },
  { title: "JSON Diff",    url: "/json-diff",   group: "Text",     keywords: ["compare", "delta"] },
  { title: "Hash",         url: "/hash",        group: "Text",     keywords: ["sha256", "sha1", "sha512", "digest", "checksum", "crypto"], shortcut: "3" },
  { title: "Base64 Encode", url: "/b64-encode", group: "Encoding", keywords: ["b64", "encode"], shortcut: "2" },
  { title: "Base64 Decode", url: "/b64-decode", group: "Encoding", keywords: ["b64", "decode"] },
  { title: "URI Encode",   url: "/uri-encode",  group: "Encoding", keywords: ["url", "percent", "escape"] },
  { title: "URI Decode",   url: "/uri-decode",  group: "Encoding", keywords: ["url", "percent", "unescape"] },
  { title: "Text Diff: Lines", url: "/txt-diff-line", group: "Text", keywords: ["compare", "delta"] },
  { title: "Text Diff: Chars", url: "/txt-diff-char", group: "Text", keywords: ["compare", "character"] },
  { title: "Date TZ",      url: "/date-tz",     group: "Dev",      keywords: ["timezone", "time", "zone"] },
  { title: "Date Epoch",   url: "/date-epoch",  group: "Dev",      keywords: ["timestamp", "unix", "time"] },
  { title: "Cron Explainer", url: "/cron",       group: "Dev",      keywords: ["schedule", "crontab", "quartz", "next run", "job"], shortcut: "4" },
  { title: "JWT Decoder",  url: "/jwt",         group: "Dev",      keywords: ["token", "bearer", "claims", "auth", "oauth"], shortcut: "5" },
  { title: "Semver Compare", url: "/semver",     group: "Dev",      keywords: ["version", "bump", "range", "caret", "tilde", "release"], shortcut: "6" },
  { title: "Color Picker", url: "/color-picker", group: "Convert", keywords: ["hex", "rgb", "hsl", "colour"] },
  { title: "Image Compressor", url: "/img-compressor", group: "Convert", keywords: ["resize", "compress", "jpeg", "png", "webp"] },
  { title: "Yaml Viz",     url: "/yaml-viz",    group: "Dev",      keywords: ["graph", "visualise", "visualize", "elk", "sigma"] },
  { title: "Todo List",    url: "/todo-list",   group: "Other",    keywords: ["tasks", "notes"] },
];

export const toolGroups: ToolGroup[] = ["Text", "Encoding", "Dev", "Convert", "Other"];

/** Tools for a group, in declared order. */
export const toolsInGroup = (group: ToolGroup) =>
  toolList.filter((t) => (t.group ?? "Other") === group);
