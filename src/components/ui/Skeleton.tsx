import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-lg bg-neutral-100 bg-gradient-to-r from-neutral-100 via-white to-neutral-100 bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none",
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}
