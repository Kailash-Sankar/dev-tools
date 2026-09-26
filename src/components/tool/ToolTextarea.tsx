import { useEffect, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Textarea that grows with its content up to `maxHeight`, then scrolls.
 *
 * The old tools hard-coded `rows={25}`, so a one-line input occupied the same
 * space as a 5,000-line paste and the panel either overflowed the viewport or
 * clipped. This measures the content instead.
 *
 * It is also a *controlled* component. The previous code combined
 * `defaultValue` with a state write on every keystroke, which is what made
 * large-paste typing feel sluggish and could drop characters.
 */
export function ToolTextarea({
  value,
  maxHeight = "32rem",
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  maxHeight?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Re-measure when the value changes from outside (paste, clear, restore).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "auto";
    const next = el.scrollHeight;
    el.style.height = `${next}px`;
  }, [value]);

  return (
    <Textarea
      {...props}
      ref={ref}
      value={value}
      spellCheck={false}
      className={cn(
        "max-h-full min-h-[7rem] resize-none overflow-auto font-mono",
        className
      )}
      style={{ maxHeight, ...props.style }}
    />
  );
}
