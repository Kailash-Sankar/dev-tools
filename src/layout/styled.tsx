import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Layout primitives for tool pages.
 *
 * These were previously `styled-components`; they are now plain Tailwind
 * class names. `cn()` is applied so callers can override any of them.
 */
export const ContentWrapper = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "w-full overflow-hidden flex flex-col bg-[radial-gradient(#212121_20%,#0000_20%),radial-gradient(#fafafa_20%,#41050514_20%)] bg-[length:10px_10px,10px_10px] bg-[position:0_0,50px_50px] bg-[#101c984d]",
      className
    )}
    {...props}
  />
);

export const PanelWrapper = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-row flex-wrap gap-2.5 p-2.5",
      // fullscreen escape hatch, driven by YamlViz's store
      "[&.fullscreen]:absolute [&.fullscreen]:inset-0 [&.fullscreen]:z-99 [&.fullscreen]:h-screen [&.fullscreen]:w-screen [&.fullscreen]:overflow-hidden [&.fullscreen]:m-0",
      className
    )}
    {...props}
  />
);

export const Panel = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  // min-w-0 is required: without it a flex child refuses to shrink below its
  // content width, which is what pushed long unbroken strings off-screen.
  <div className={cn("flex-1 min-w-0 max-w-full", className)} {...props} />
);

export const PreWrap = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "overflow-auto rounded-md bg-[#282c34] p-2.5 font-mono text-foreground",
      "whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
      className
    )}
    {...props}
  />
);

export const SectionTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-1.5 text-sm", className)} {...props} />
);

export const FlexRow = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-row flex-wrap gap-2.5", className)} {...props} />
);

export const FlexCol = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2.5", className)} {...props} />
);
