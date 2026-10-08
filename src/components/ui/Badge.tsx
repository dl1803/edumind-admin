import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "error" | "info" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const toneMap: Record<BadgeTone, string> = {
  success: "text-emerald-700",
  warning: "text-amber-700",
  error: "text-rose-700",
  info: "text-blue-700",
  neutral: "text-neutral-700",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn("text-sm font-medium", toneMap[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}
