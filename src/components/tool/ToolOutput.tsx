import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Scrollable, wrapping-safe output area.
 *
 * This is the fix for the layout problem where large content blew out the
 * panel. Two separate things were wrong before:
 *
 *  1. `white-space: pre-wrap` only breaks at whitespace that already exists.
 *     Base64 / minified JSON / long URLs are single unbroken tokens, so they
 *     never wrapped -- they overflowed and got clipped.
 *  2. The panel it sat in had no `min-w-0`, so it refused to shrink.
 *
 * `break-words` + `overflow-wrap: anywhere` is what actually forces a break
 * inside an unbreakable token. `min-h-0` + `overflow-auto` lets this scroll
 * instead of growing forever.
 */
export function ToolOutput({
  children,
  className,
  empty,
}: {
  children?: ReactNode;
  className?: string;
  /** Shown instead of the children when there is nothing to show. */
  empty?: ReactNode;
}) {
  const isEmpty = children === null || children === undefined || children === "";

  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-auto rounded-md border bg-muted/40 p-2.5 font-mono text-sm",
        "whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]",
        className
      )}
    >
      {isEmpty ? empty : children}
    </div>
  );
}
