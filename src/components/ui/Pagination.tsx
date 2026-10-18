"use client";

import * as React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  hideOnSinglePage?: boolean;
}

export function getPageItems(page: number, pageCount: number): (number | "...")[] {
  const safePageCount = Math.max(1, pageCount);

  if (safePageCount <= 4) {
    return Array.from({ length: safePageCount }, (_, i) => i + 1);
  }

  return [1, 2, 3, "...", safePageCount];
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  hideOnSinglePage = false,
}: PaginationProps) {
  if (pageCount <= 1 && hideOnSinglePage) return null;

  const effectivePageCount = Math.max(1, pageCount);
  const safePage = Math.max(1, Math.min(page, effectivePageCount));
  const items = getPageItems(safePage, effectivePageCount);

  return (
    <nav aria-label="Phân trang" className={cn("flex items-center gap-1.5", className)}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
        title="Trang trước"
      >
        <CaretLeft size={16} />
      </button>

      {items.map((item, idx) =>
        typeof item !== "number" ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-neutral-400 select-none tabular-nums">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === safePage ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs tabular-nums transition cursor-pointer",
              item === safePage
                ? "bg-purple-600 text-white font-bold"
                : "text-neutral-700 hover:bg-purple-50 hover:text-purple-700 font-medium"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= effectivePageCount}
        onClick={() => onPageChange(page + 1)}
        className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
        title="Trang tiếp theo"
      >
        <CaretRight size={16} />
      </button>
    </nav>
  );
}
