"use client";

import React from "react";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { Category } from "@/types/category.types";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isLoading?: boolean;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  isLoading = false,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-100 p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-neutral-800">Chưa có danh mục nào</p>
        <p className="text-xs text-neutral-400">
          Hãy bấm vào nút &quot;Thêm danh mục&quot; ở trên để tạo danh mục đầu tiên cho hệ thống.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-neutral-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-purple-50/40 text-[11px] font-bold text-neutral-600 uppercase tracking-wider border-b border-purple-100/80 whitespace-nowrap">
              <th className="py-3.5 px-6 min-w-[280px] text-left">Tên danh mục</th>
              <th className="py-3.5 px-6 w-44 min-w-[140px] text-center">Số khóa học</th>
              <th className="py-3.5 px-6 w-44 min-w-[140px] text-center">Trạng thái</th>
              <th className="py-3.5 px-6 w-36 min-w-[120px] text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
            {categories.map((category) => (
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

                {/* Số khóa học */}
                <td className="py-3.5 px-6 text-center font-sans tabular-nums text-neutral-700 text-xs font-medium whitespace-nowrap">
                  {category.courseCount > 0 ? (
                    <span>{category.courseCount} khóa học</span>
                  ) : (
                    <span className="text-neutral-400">0 khóa học</span>
                  )}
                </td>

                {/* Trạng thái - Tuân thủ Zero-Pill Rule (Pure Flat Text kèm dot tròn) */}
                <td className="py-3.5 px-6 text-center whitespace-nowrap">
                  {category.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Tạm ẩn
                    </span>
                  )}
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
    </div>
  );
}
