import type { Change } from "diff";

import { ToolOutput } from "@/components/tool/ToolOutput";
import { cn } from "@/lib/utils";

/**
 * Renders `diff` output with added/removed runs highlighted.
 *
 * JSON Diff, Text Diff (lines) and Text Diff (chars) each had their own copy
 * of this loop. Collapsing them also removes the copy-paste bug where
 * LineDiff struck through removed text but JSON Diff did not.
 */
export function DiffOutput({
  changes,
  className,
  empty = "No differences or invalid input.",
  showStrikethrough = true,
}: {
  changes: Change[] | undefined;
  className?: string;
  empty?: React.ReactNode;
  /** JSON diff highlights by color only; text diffs also strike through. */
  showStrikethrough?: boolean;
}) {
  if (!changes || changes.length === 0) {
    return <ToolOutput className={className} empty={empty} />;
  }

  return (
    <ToolOutput className={className}>
      {changes.map((part, index) => (
        <span
          key={index}
          className={cn(
            part.added && "bg-add-soft text-add",
            part.removed && "bg-del-soft text-del",
            showStrikethrough && part.removed && "line-through decoration-del/60"
          )}
        >
          {part.value}
        </span>
      ))}
    </ToolOutput>
  );
}
