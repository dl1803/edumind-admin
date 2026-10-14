"use client";

import React from "react";
import {
  MagnifyingGlass,
  X,
  CaretUp,
  CaretDown,
  CaretUpDown,
} from "@phosphor-icons/react";
import { DataTableProps } from "./types";
import { useDataTableState } from "./useDataTableState";
import { DataTableEmpty } from "./DataTableEmpty";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

export function DataTable<T>({
  data,
  columns,
  rowKey,
  mode = "client",
  isLoading = false,
  skeletonRows = 6,
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  searchKeys,
  filters = [],
  sort: controlledSort,
  onSortChange,
  page: controlledPage,
  pageSize: controlledPageSize,
  pageSizeOptions = [10, 20, 50],
  total: controlledTotal,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onFilterChange,
  onRowClick,
  emptyState,
  toolbar,
  className,
}: DataTableProps<T>) {
  const state = useDataTableState({
    data,
    columns,
    mode,
    pageSizeDefault: controlledPageSize || 10,
    searchKeys,
    initialSort: controlledSort,
    onSortChangeExternal: onSortChange,
    onPageChangeExternal: onPageChange,
    onPageSizeChangeExternal: onPageSizeChange,
    onSearchChangeExternal: onSearchChange,
    onFilterChangeExternal: onFilterChange,
  });

  const currentPage = mode === "server" ? (controlledPage || 1) : state.page;
  const currentPageSize = mode === "server" ? (controlledPageSize || 10) : state.pageSize;
  const currentTotal = mode === "server" ? (controlledTotal || 0) : state.totalItems;
  const activeSort = mode === "server" ? controlledSort : state.sortState;

  const totalPages = Math.ceil(currentTotal / currentPageSize) || 1;
  const fromIndex = currentTotal === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const toIndex = Math.min(currentPage * currentPageSize, currentTotal);

  const displayData = mode === "server" ? data : state.paginatedData;

  return (
    <div className={cn("space-y-4", className)}>
      {(searchable || filters.length > 0 || toolbar) && (
        <div className="bg-white p-4 rounded-xl border border-purple-100/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {searchable && (
              <div className="relative flex-1 min-w-[220px] max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                  <MagnifyingGlass size={14} />
                </span>
                <input
                  type="text"
                  value={state.searchQuery}
                  onChange={(e) => state.handleSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  disabled={isLoading}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors disabled:opacity-50"
                />
                {state.searchQuery && (
                  <button
                    type="button"
                    onClick={() => state.handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                    title="Xóa tìm kiếm"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {filters.map((filter) => (
              <select
                key={filter.key}
                value={state.filterValues[filter.key] || ""}
                onChange={(e) => state.handleFilterChange(filter.key, e.target.value)}
                disabled={isLoading}
                className="py-1.5 px-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-medium focus:outline-none focus:border-purple-600 cursor-pointer disabled:opacity-50"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>

          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="bg-white rounded-xl border border-purple-100/80 shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table
            className="w-full table-fixed text-left border-collapse min-w-[960px]"
            aria-busy={isLoading}
          >
            <thead>
              <tr className="bg-purple-50/50 text-[11px] font-bold text-neutral-600 uppercase tracking-wider border-b border-purple-100 whitespace-nowrap">
                {columns.map((col) => {
                  const isSorted = activeSort?.key === col.key;
                  const sortDir = activeSort?.direction;
                  const hAlign = col.headerAlign || "center";

                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        col.sortable
                          ? isSorted
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                          : undefined
                      }
                      style={{ width: col.width }}
                      className={cn(
                        "py-3.5 px-4 text-xs font-semibold text-neutral-600",
                        hAlign === "center" && "text-center",
                        hAlign === "left" && "text-left",
                        hAlign === "right" && "text-right",
                        col.className
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            if (mode === "server") {
                              const nextDir =
                                !isSorted ? "asc" : sortDir === "asc" ? "desc" : null;
                              onSortChange?.(nextDir ? { key: col.key, direction: nextDir } : null);
                            } else {
                              state.handleSort(col.key);
                            }
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 hover:text-purple-700 transition font-bold group",
                            hAlign === "center" && "mx-auto justify-center",
                            hAlign === "left" && "mr-auto justify-start",
                            hAlign === "right" && "ml-auto justify-end",
                            isSorted && "text-purple-700"
                          )}
                        >
                          <span>{col.header}</span>
                          <span className="text-neutral-400 group-hover:text-purple-600">
                            {isSorted ? (
                              sortDir === "asc" ? (
                                <CaretUp size={14} weight="bold" className="text-purple-700" />
                              ) : (
                                <CaretDown size={14} weight="bold" className="text-purple-700" />
                              )
                            ) : (
                              <CaretUpDown size={14} />
                            )}
                          </span>
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "inline-block",
                            hAlign === "center" && "text-center",
                            hAlign === "left" && "text-left",
                            hAlign === "right" && "text-right"
                          )}
                        >
                          {col.header}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-50 text-xs text-neutral-800">
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, rIdx) => (
                  <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={`skeleton-cell-${rIdx}-${cIdx}`} className="py-4 px-4">
                        <Skeleton
                          className={cn(
                            "h-4 rounded",
                            cIdx === 0 ? "w-4/5" : cIdx % 2 === 0 ? "w-2/3" : "w-1/2",
                            col.align === "center" && "mx-auto",
                            col.align === "right" && "ml-auto"
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <DataTableEmpty
                  isFiltered={state.isFiltered}
                  title={emptyState?.title}
                  description={emptyState?.description}
                  action={emptyState?.action}
                  onResetFilters={state.resetFilters}
                  colSpan={columns.length}
                />
              ) : (
                displayData.map((row) => {
                  const key = rowKey(row);
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "transition-colors hover:bg-purple-50/30",
                        onRowClick && "cursor-pointer"
                      )}
                    >
                      {columns.map((col) => {
                        let content: React.ReactNode = null;
                        if (col.cell) {
                          content = col.cell(row);
                        } else if (typeof col.accessor === "function") {
                          content = col.accessor(row) as React.ReactNode;
                        } else if (col.accessor) {
                          content = row[col.accessor] as unknown as React.ReactNode;
                        }

                        return (
                          <td
                            key={`${key}-${col.key}`}
                            className={cn(
                              "py-3.5 px-4 text-xs font-normal",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right",
                              col.className
                            )}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && currentTotal > 0 && (
          <div className="p-4 border-t border-purple-100/80 bg-neutral-50/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
              <span>
                Hiển thị <span className="font-bold text-neutral-900">{fromIndex}</span>–
                <span className="font-bold text-neutral-900">{toIndex}</span> /{" "}
                <span className="font-bold text-neutral-900">{currentTotal}</span> kết quả
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span>Dòng:</span>
                <select
                  value={currentPageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    if (mode === "server") {
                      onPageSizeChange?.(newSize);
                    } else {
                      state.handlePageSizeChange(newSize);
                    }
                  }}
                  className="py-1 px-2 text-xs bg-white border border-neutral-200 rounded text-neutral-700 font-medium focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  {pageSizeOptions.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Pagination
              page={currentPage}
              pageCount={totalPages}
              onPageChange={(p) => {
                if (mode === "server") {
                  onPageChange?.(p);
                } else {
                  state.handlePageChange(p);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
