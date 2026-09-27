/**
 * TOML parsing, via `smol-toml` (zero dependencies, BSD-3).
 *
 * Complements the existing YAML tool: `pyproject.toml` and `Cargo.toml` are
 * TOML, and neither is JSON, so there was no way to read one before.
 *
 * Parsing happens in this module; the page decides how to present it.
 */
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";

export class TomlError extends Error {}

/** Sizes past this are refused: a browser tab freezing is a worse outcome
 *  than a clear error, and a multi-megabyte TOML is not a human task. */
export const MAX_TOML_BYTES = 2 * 1024 * 1024;

export function parseTomlDocument(source: string): Record<string, unknown> {
  const text = source.trim();
  if (!text) throw new TomlError("Paste some TOML to parse.");

  // Bytes, not characters, since that is what actually bounds the work.
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > MAX_TOML_BYTES) {
    throw new TomlError(
      `Input is ${(bytes / 1024 / 1024).toFixed(1)} MB, over the ${MAX_TOML_BYTES / 1024 / 1024} MB limit.`
    );
  }

  try {
    return parseToml(text) as Record<string, unknown>;
  } catch (e) {
    throw new TomlError(e instanceof Error ? e.message : String(e));
  }
}

export function tomlToJson(source: string): string {
  return JSON.stringify(parseTomlDocument(source), null, 2);
}

export function jsonToToml(source: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (e) {
    throw new TomlError(`Input is not valid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
  try {
    return stringifyToml(parsed as Record<string, unknown>);
  } catch (e) {
    // smol-toml refuses heterogeneous arrays and undefined, both of which
    // are legal JSON. Saying so is more useful than a raw type error.
    throw new TomlError(
      `Valid JSON, but not representable as TOML: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

/** Flatten to dotted paths, so large documents can be scanned quickly. */
export function flattenToml(value: unknown, prefix = ""): { path: string; type: string; value: string }[] {
  if (value === null || typeof value !== "object") {
    return [{ path: prefix || "(root)", type: typeName(value), value: preview(value) }];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [{ path: prefix || "(root)", type: "array", value: "[]" }];
    }
    return value.flatMap((item, i) => flattenToml(item, `${prefix}[${i}]`));
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return [{ path: prefix || "(root)", type: "table", value: "{}" }];
  }
  return entries.flatMap(([k, v]) => flattenToml(v, prefix ? `${prefix}.${k}` : k));
}

const typeName = (v: unknown): string => {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
};

const preview = (v: unknown): string => {
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  return String(v);
};
