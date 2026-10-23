"use client";

import React from "react";
import { Warning, X } from "@phosphor-icons/react";
import { Category } from "@/types/category.types";

interface DeleteCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: Category) => void;
  isDeleting?: boolean;
}

export function DeleteCategoryModal({
  category,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteCategoryModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;

  const hasCourses = category.courseCount > 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 mx-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl ${
                hasCourses ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
              }`}
            >
              <Warning size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {hasCourses ? "Không thể xóa danh mục" : "Xóa danh mục khóa học?"}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {hasCourses
                  ? "Danh mục đang chứa khóa học liên kết"
                  : "Thao tác này không thể hoàn tác"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer"
            title="Đóng"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        {hasCourses ? (
          <div className="bg-amber-50/70 border border-amber-200/80 text-amber-900 rounded-xl p-4 my-4 text-xs leading-relaxed space-y-1.5 font-sans">
            <p>
              Danh mục <strong className="font-bold text-amber-950">&ldquo;{category.name}&rdquo;</strong> hiện đang có{" "}
              <strong className="font-bold text-amber-950 tabular-nums">
                {category.courseCount} khóa học
              </strong>.
            </p>
            <p className="text-amber-800 text-[11px]">
              Vui lòng chuyển các khóa học sang danh mục khác trước khi xóa danh mục này khỏi hệ thống.
            </p>
          </div>
        ) : (
          <div className="bg-red-50/70 border border-red-200/80 text-red-900 rounded-xl p-4 my-4 text-xs leading-relaxed space-y-1.5 font-sans">
            <p>
              Bạn có chắc chắn muốn xóa vĩnh viễn danh mục{" "}
              <strong className="font-bold text-red-950">&ldquo;{category.name}&rdquo;</strong>?
            </p>
            <p className="text-red-800 text-[11px]">
              Dữ liệu danh mục sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và không thể khôi phục lại.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 min-w-[90px] px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>

          {hasCourses ? (
            <button
              type="button"
              onClick={onClose}
              className="h-9 min-w-[90px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
            >
              Đã hiểu
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirm(category)}
              disabled={isDeleting}
              className="h-9 min-w-[90px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
