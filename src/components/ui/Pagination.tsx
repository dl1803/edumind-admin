"use client";

import * as React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function getPageItems(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "…", pageCount];
  }
  if (page >= pageCount - 3) {
    return [1, "…", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, "…", page - 1, page, page + 1, "…", pageCount];
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const items = getPageItems(page, pageCount);

  return (
    <nav aria-label="Phân trang" className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-300 text-sm text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100"
      >
        <CaretLeft size={16} />
      </button>

      {items.map((item, idx) =>
        item === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-neutral-400 select-none">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              "h-9 min-w-9 rounded-lg text-sm font-medium transition-colors",
              item === page
                ? "bg-primary-50 text-primary-700 font-semibold border border-primary-600"
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-300 text-sm text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100"
      >
        <CaretRight size={16} />
      </button>
    </nav>
  );
}
