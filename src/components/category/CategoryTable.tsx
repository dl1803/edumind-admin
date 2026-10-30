"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PencilSimple,
  Trash,
  CaretUp,
  CaretDown,
  CaretUpDown,
} from "@phosphor-icons/react";
import { Category } from "@/types/category.types";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

export type CategorySortKey = "name" | "courseCount" | "createdAt";
export type CategorySortDirection = "asc" | "desc";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isLoading?: boolean;
  sortKey?: CategorySortKey;
  sortDir?: CategorySortDirection;
  onSort?: (key: CategorySortKey) => void;
  isSearching?: boolean;
  onResetSearch?: () => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  isLoading = false,
  sortKey,
  sortDir,
  onSort,
  isSearching = false,
  onResetSearch,
}: CategoryTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const total = categories.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const safePage = Math.max(1, Math.min(page, totalPages));
  const fromIndex = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toIndex = Math.min(safePage * pageSize, total);

  const paginatedCategories = useMemo(() => {
    return categories.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [categories, safePage, pageSize]);

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-100 p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-neutral-800">
          {isSearching ? "Không tìm thấy danh mục nào phù hợp" : "Chưa có danh mục nào"}
        </p>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          {isSearching
            ? "Không có kết quả nào khớp với từ khóa tìm kiếm của bạn. Hãy thử tìm với từ khóa khác."
            : "Hãy bấm vào nút \"Thêm danh mục\" ở trên để tạo danh mục đầu tiên cho hệ thống."}
        </p>
        {isSearching && onResetSearch && (
          <button
            type="button"
            onClick={onResetSearch}
            className="mt-2 px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition cursor-pointer"
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>
    );
  }

  const renderSortIcon = (key: CategorySortKey) => {
    if (sortKey !== key) {
      return (
        <CaretUpDown
          size={13}
          className="text-neutral-400 opacity-60 group-hover/th:opacity-100 transition"
        />
      );
    }
    return sortDir === "asc" ? (
      <CaretUp size={13} weight="bold" className="text-purple-600" />
    ) : (
      <CaretDown size={13} weight="bold" className="text-purple-600" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-neutral-100">
      <div className="overflow-x-auto rounded-t-2xl">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-purple-50/40 text-[11px] font-bold text-neutral-600 uppercase tracking-wider border-b border-purple-100/80 whitespace-nowrap">
              {/* Tên danh mục */}
              <th className="py-3.5 px-6 min-w-[280px] text-left">
                <button
                  type="button"
                  onClick={() => onSort?.("name")}
                  className="group/th inline-flex items-center gap-1.5 font-bold uppercase cursor-pointer hover:text-purple-700 transition"
                  title="Sắp xếp theo tên danh mục"
                >
                  <span>Tên danh mục</span>
                  {renderSortIcon("name")}
                </button>
              </th>

              {/* Số khóa học */}
              <th className="py-3.5 px-6 w-44 min-w-[140px] text-center">
                <button
                  type="button"
                  onClick={() => onSort?.("courseCount")}
                  className="group/th inline-flex items-center justify-center gap-1.5 font-bold uppercase cursor-pointer hover:text-purple-700 transition"
                  title="Sắp xếp theo số khóa học"
                >
                  <span>Số khóa học</span>
                  {renderSortIcon("courseCount")}
                </button>
              </th>

              {/* Ngày tạo */}
              <th className="py-3.5 px-6 w-44 min-w-[140px] text-center">
                <button
                  type="button"
                  onClick={() => onSort?.("createdAt")}
                  className="group/th inline-flex items-center justify-center gap-1.5 font-bold uppercase cursor-pointer hover:text-purple-700 transition"
                  title="Sắp xếp theo ngày tạo"
                >
                  <span>Ngày tạo</span>
                  {renderSortIcon("createdAt")}
                </button>
              </th>

              {/* Hành động */}
              <th className="py-3.5 px-6 w-36 min-w-[120px] text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
            {paginatedCategories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-purple-50/30 transition group"
              >
                {/* Tên danh mục & Mô tả */}
                <td className="py-3.5 px-6 text-left">
                  <div className="text-left">
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="font-semibold text-neutral-900 text-sm hover:text-purple-700 transition-colors block text-left cursor-pointer"
                    >
                      {category.name}
                    </button>
                    <span className="text-xs text-neutral-400 mt-0.5 block truncate max-w-md">
                      {category.description || category.slug}
                    </span>
                  </div>
                </td>

                {/* Số khóa học (Flat Text) */}
                <td className="py-3.5 px-6 text-center font-sans tabular-nums text-neutral-700 text-xs font-medium whitespace-nowrap">
                  {category.courseCount > 0 ? (
                    <span>{category.courseCount} khóa học</span>
                  ) : (
                    <span className="text-neutral-400">0 khóa học</span>
                  )}
                </td>

                {/* Ngày tạo */}
                <td className="py-3.5 px-6 text-center font-sans tabular-nums text-neutral-600 text-xs whitespace-nowrap">
                  {formatDate(category.createdAt)}
                </td>

                {/* Thao tác Sửa / Xóa */}
                <td className="py-3.5 px-6 text-center whitespace-nowrap">
                  <div className="inline-flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 rounded-lg transition font-medium text-xs inline-flex items-center gap-1 border border-purple-200 cursor-pointer"
                      title="Chỉnh sửa danh mục"
                    >
                      <PencilSimple size={14} weight="bold" />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(category)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-xs inline-flex items-center gap-1 border border-red-200 cursor-pointer"
                      title="Xóa danh mục"
                    >
                      <Trash size={14} weight="bold" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer with dynamic pagination */}
      <div className="p-4 border-t border-purple-100 bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <span>
            Hiển thị{" "}
            <strong className="text-neutral-800 font-bold tabular-nums">
              {fromIndex} - {toIndex}
            </strong>{" "}
            trong tổng số{" "}
            <strong className="text-neutral-800 font-bold tabular-nums">
              {total}
            </strong>{" "}
            danh mục
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <span>Dòng:</span>
            <SelectDropdown
              value={pageSize}
              options={[5, 10, 20].map((sz) => ({
                label: `${sz}`,
                value: `${sz}`,
              }))}
              onChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
              size="sm"
              placement="top"
              className="bg-white"
            />
          </div>
        </div>

        <Pagination
          page={page}
          pageCount={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
