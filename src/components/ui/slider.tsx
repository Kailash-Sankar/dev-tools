import * as React from "react"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    value?: number[]
    min?: number
    max?: number
    step?: number
    onValueChange?: (value: number[]) => void
  }
>(({ className, value, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
  const current = value?.[0] ?? min
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current}
      onKeyDown={(e) => {
        if (!onValueChange) return
        const delta = e.key === "ArrowRight" || e.key === "ArrowUp" ? step
          : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step
          : 0
        if (delta === 0) return
        e.preventDefault()
        onValueChange([Math.min(max, Math.max(min, current + delta))])
      }}
      className={cn(
        "relative flex h-5 w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <div className="absolute h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div
        className="pointer-events-none absolute block size-4 rounded-full border-2 border-primary bg-background shadow"
        style={{ left: `calc(${pct}% - 0.5rem)` }}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
