import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const FloatingPanel = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("absolute right-[15px] bottom-[3px] z-99 bg-[#333] p-0.5", className)}
    {...props}
  />
);
