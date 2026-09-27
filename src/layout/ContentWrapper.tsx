import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * App shell background.
 *
 * Previously one of several `styled-components` helpers. All of the others
 * have been superseded by the shared tool primitives in `src/components/tool`
 * and were removed rather than left as dead code.
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
