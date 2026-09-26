import type { HTMLAttributes, ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Container = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col items-center p-5", className)}
    {...props}
  />
);

export const Toolbox = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mb-5 flex items-center gap-2.5", className)}
    {...props}
  />
);

export const Panels = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex w-full max-w-[800px] justify-between", className)}
    {...props}
  />
);

export const Panel = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center gap-2.5 border border-border p-2.5 mx-2.5 min-w-0",
      className
    )}
    {...props}
  />
);

export const ImagePreview = ({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    className={cn("max-h-[300px] max-w-full object-contain", className)}
    {...props}
  />
);

export const SizeInfo = ({
  className,
  isSavingPositive,
  ...props
}: HTMLAttributes<HTMLDivElement> & { isSavingPositive: boolean }) => (
  <div
    className={cn(isSavingPositive ? "text-green-500" : "text-red-500", className)}
    {...props}
  />
);
