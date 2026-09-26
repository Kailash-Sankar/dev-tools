import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Two-column (stacking on narrow screens) grid for tool pages.
 *
 * Every tool used to hand-roll `<PanelWrapper>` with `flex-wrap`, which meant
 * the panels only lined up when the viewport happened to be wide enough. A
 * grid gives a real breakpoint, and the fixed row height means both columns
 * always scroll independently instead of one growing past the other.
 */
export function ToolLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-stretch gap-3 p-3",
        "lg:h-[calc(100dvh-2rem)] lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Optional heading above the grid, for tools with more than two panels. */
export function ToolLayoutHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 px-3 pt-3", className)}>
      {children}
    </div>
  );
}
