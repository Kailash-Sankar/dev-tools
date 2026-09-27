/**
 * MIME type lookup.
 *
 * Originally wrapped the `mime-types` package, which was dropped: it is
 * CommonJS and depends on `mime-db` and `path-browserify`, and Rollup's
 * CommonJS interop mis-bundles that combination. The built output bound
 * `lookup`'s internal `path.extname` reference to an unrelated priority-map
 * object, so the tool threw "s is not a function" in the browser while
 * passing every unit test under Node. Rather than ship a broken tool or pin a
 * bundler workaround, the common types are inlined.
 *
 * Trade-off, stated plainly: this is a curated subset covering everyday web
 * and build tooling, not the full IANA registry. An exotic type will not be
 * found. The upstream package's 53 MB `mime-db` was not worth carrying for
 * that, and an empty-dependency lookup has a much better safety story.
 */

export type MimeDirection = "extension" | "type";

/** extension -> media type. The single source of truth for both directions. */
const BY_EXTENSION: Record<string, string> = {
  // text & data
  html: "text/html", htm: "text/html", css: "text/css", csv: "text/csv",
  txt: "text/plain", md: "text/markdown", xml: "text/xml", vtt: "text/vtt",
  rtx: "text/richtext", ics: "text/calendar",
  js: "text/javascript", mjs: "text/javascript", cjs: "text/javascript",
  json: "application/json", jsonl: "application/json", map: "application/json",
  yaml: "application/yaml", yml: "application/yaml", toml: "text/toml",
  wasm: "application/wasm", pdf: "application/pdf", zip: "application/zip",
  epub: "application/epub+zip", rtf: "application/rtf",
  gz: "application/gzip", tgz: "application/gzip", bz2: "application/x-bzip2",
  tar: "application/x-tar", br: "application/brotli", "7z": "application/x-7z-compressed",
  rss: "application/rss+xml", atom: "application/atom+xml",
  webmanifest: "application/manifest+json", graphql: "application/graphql",
  ipynb: "application/x-ipynb+json", ndjson: "application/x-ndjson",

  // fonts
  woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf", otf: "font/otf",
  eot: "application/vnd.ms-fontobject",

  // images
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", svg: "image/svg+xml", bmp: "image/bmp",
  ico: "image/x-icon", tif: "image/tiff", tiff: "image/tiff", heic: "image/heic",
  heif: "image/heif", jxl: "image/jxl",

  // audio & video
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg",
  opus: "audio/opus", flac: "audio/flac", aac: "audio/aac", m4a: "audio/mp4",
  weba: "audio/webm", mid: "audio/midi",
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", ogv: "video/ogg",
  mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
  mpeg: "video/mpeg",
  // Note: no `ts: video/mp2t`. The .ts extension is claimed above for
  // TypeScript, which is what a developer pasting an extension here means.
  // MPEG transport streams are reachable by type only, via the override
  // below.

  // office
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",

  // dev / build
  sh: "application/x-sh", bash: "application/x-sh", py: "text/x-python",
  rb: "text/x-ruby", rs: "text/rust", go: "text/x-go", c: "text/x-c",
  h: "text/x-c", cpp: "text/x-c", hpp: "text/x-c", ts: "text/x-typescript",
  tsx: "text/x-typescript", java: "text/x-java", php: "text/x-php",
  swift: "text/x-swift", kt: "text/x-kotlin", sql: "text/x-sql",
  tomlignore: "text/plain", lock: "text/plain", log: "text/plain",
  pem: "application/x-pem-file", crt: "application/x-x509-ca-cert",
  der: "application/x-x509-ca-cert", p12: "application/x-pkcs12",
  pfx: "application/x-pkcs12", key: "application/pkcs8",

  // fonts metadata / design
  woff2map: "application/json", avifs: "image/avif",
};

/**
 * Types whose preferred extension is shadowed by a more common one, so
 * reverse lookup still resolves them.
 */
const EXTENSION_OVERRIDES: Record<string, string> = {
  "video/mp2t": "ts",
  "text/plain": "txt",
  "image/jpeg": "jpg",
  "text/html": "html",
  "audio/mpeg": "mp3",
  "application/json": "json",
  "text/javascript": "js",
  "application/octet-stream": "bin",
};

/** Reverse index, first extension wins for a type with several (e.g. jpg/jpeg). */
const BY_TYPE: Record<string, string> = (() => {
  const out: Record<string, string> = { ...EXTENSION_OVERRIDES };
  for (const [ext, type] of Object.entries(BY_EXTENSION)) {
    if (!(type in out)) out[type] = ext;
  }
  return out;
})();

/** Types whose default is a UTF-8 text encoding, per the WHATWG mimesniff table. */
const TEXTUAL = /^text\/|\+json$|\+xml$|^application\/(javascript|json|xml|yaml|x-sh|x-yaml|graphql|manifest\+json|ld\+json|x-www-form-urlencoded)$/;

export const lookupExtension = (input: string): string | null => {
  const ext = input.trim().replace(/^\./, "").toLowerCase();
  if (!ext) return null;
  return BY_EXTENSION[ext] ?? null;
};

export const lookupType = (input: string): string | null => {
  // Strip parameters: "text/html; charset=utf-8" -> "text/html".
  const type = input.trim().toLowerCase().split(";")[0].trim();
  if (!type) return null;
  return BY_TYPE[type] ?? null;
};

export const resolve = (input: string, direction: MimeDirection): string | null =>
  direction === "extension" ? lookupExtension(input) : lookupType(input);

/** The default charset implied for a media type, if any. */
export const describe = (type: string): string | null =>
  TEXTUAL.test(type.trim().toLowerCase()) ? "charset=utf-8" : null;

export const EXTENSION_COUNT = Object.keys(BY_EXTENSION).length;

export const COMMON_TYPES = [
  "html", "css", "js", "mjs", "json", "xml", "csv", "txt", "md", "yaml", "toml",
  "png", "jpg", "webp", "avif", "svg", "gif", "ico",
  "woff2", "woff", "ttf", "otf",
  "mp4", "webm", "mp3", "wav",
  "pdf", "zip", "gz", "wasm", "webmanifest", "epub", "ics", "rtf",
];
