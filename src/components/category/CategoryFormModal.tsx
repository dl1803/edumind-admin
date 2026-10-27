"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag, X } from "@phosphor-icons/react";
import { categoryFormSchema, CategoryFormSchemaType } from "@/lib/validations/category.schema";
import { Category, CategoryFormValues } from "@/types/category.types";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  initialData?: Category | null;
  isSubmitting?: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: CategoryFormModalProps) {
  const isEditMode = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormSchemaType>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: "ACTIVE",
    },
  });

  const categoryName = watch("name");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        status: initialData.status,
      });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        status: "ACTIVE",
      });
    }
  }, [initialData, reset, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    if (!isEditMode) {
      setValue("slug", generateSlug(val), { shouldValidate: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 mx-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-xl">
              <Tag size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Phân loại khóa học trong hệ thống EduMind
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4 text-xs font-sans">
          {/* Tên danh mục */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5 text-xs">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên danh mục (ví dụ: Lập trình Python)"
              {...register("name")}
              onChange={handleNameChange}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl focus:outline-none focus:border-purple-600 font-medium text-neutral-900 text-xs transition ${
                errors.name ? "border-red-500" : "border-neutral-200"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-[11px] mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5 text-xs">
              Đường dẫn (Slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="lap-trinh-python"
              {...register("slug")}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl focus:outline-none focus:border-purple-600 font-mono text-neutral-800 text-xs transition ${
                errors.slug ? "border-red-500" : "border-neutral-200"
              }`}
            />
            {errors.slug && (
              <p className="text-red-500 text-[11px] mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-medium text-neutral-700 text-xs">Mô tả</label>
              <span className="text-[11px] text-neutral-400 font-normal">Tùy chọn</span>
            </div>
            <textarea
              rows={3}
              placeholder="Nhập mô tả danh mục (tùy chọn)..."
              {...register("description")}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl focus:outline-none focus:border-purple-600 text-neutral-700 text-xs resize-none font-sans leading-relaxed transition ${
                errors.description ? "border-red-500" : "border-neutral-200"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-[11px] mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Trạng thái hoạt động */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5 text-xs">
              Trạng thái hoạt động
            </label>
            <SelectDropdown
              value={watch("status") || "ACTIVE"}
              options={[
                { label: "Hoạt động (Hiển thị cho học viên)", value: "ACTIVE" },
                { label: "Tạm ẩn (Không hiển thị)", value: "INACTIVE" },
              ]}
              onChange={(val) =>
                setValue("status", val as "ACTIVE" | "INACTIVE", {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              fullWidth
              size="lg"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 min-w-[90px] px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 min-w-[90px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Lưu danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
