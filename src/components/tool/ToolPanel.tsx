import type { ReactNode } from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A single tool panel (one card in a {@link ToolLayout}).
 *
 * Replaces the repeated `Card style={{ height: '100%' }}` + fixed
 * `rows={25}` pattern. The content area is `min-h-0` so it can actually
 * shrink inside the grid row, and it scrolls rather than clipping.
 */
export function ToolPanel({
  title,
  actions,
  children,
  className,
  contentClassName,
}: {
  title: ReactNode;
  /** Rendered in the card footer -- usually the run/format button. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn(
        // min-w-0: without it a grid/flex child won't shrink below its content
        "flex min-w-0 flex-col overflow-hidden",
        className
      )}
    >
      <CardHeader className="shrink-0 py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto",
          contentClassName
        )}
      >
        {children}
      </CardContent>
      {actions ? (
        <CardFooter className="shrink-0 gap-2 py-3">{actions}</CardFooter>
      ) : null}
    </Card>
  );
}
