import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: "none" | "md" | "lg";
}

export function Card({
  title,
  actions,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: "p-0",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-neutral-100 shadow-sm",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
          {title && <h4 className="text-lg font-semibold text-neutral-950">{title}</h4>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
