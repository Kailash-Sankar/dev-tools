/**
 * String-case conversion.
 *
 * Wraps `change-case` so the UI has one vocabulary and so the tricky
 * separators (spaces, punctuation, camelCase boundaries) behave consistently.
 *
 * The awkward part of case conversion is splitting an existing identifier.
 * "userID" must become "user id" and "HTTPServer" must not become
 * "h-t-t-p-server", so the library's split rules are used rather than a
 * naive split on capitals.
 */
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
  trainCase,
} from "change-case";

export const CASE_FORMATS = [
  { id: "camel", label: "camelCase", example: "userFirstName", fn: camelCase },
  { id: "pascal", label: "PascalCase", example: "UserFirstName", fn: pascalCase },
  { id: "snake", label: "snake_case", example: "user_first_name", fn: snakeCase },
  { id: "constant", label: "CONSTANT_CASE", example: "USER_FIRST_NAME", fn: constantCase },
  { id: "kebab", label: "kebab-case", example: "user-first-name", fn: kebabCase },
  { id: "dot", label: "dot.case", example: "user.first.name", fn: dotCase },
  { id: "path", label: "path/case", example: "user/first/name", fn: pathCase },
  { id: "train", label: "Train-Case", example: "User-First-Name", fn: trainCase },
  { id: "space", label: "space case", example: "user first name", fn: capitalCase },
  { id: "sentence", label: "Sentence case", example: "User first name", fn: sentenceCase },
] as const;

export type CaseFormatId = (typeof CASE_FORMATS)[number]["id"];

export const convertCase = (input: string, format: CaseFormatId): string => {
  const spec = CASE_FORMATS.find((f) => f.id === format);
  if (!spec) throw new Error(`Unknown case format: ${format}`);
  return spec.fn(input);
};
