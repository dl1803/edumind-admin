"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  MagnifyingGlass,
  CaretRight,
} from "@phosphor-icons/react";
import { useCategoriesList, useSaveCategory, useDeleteCategory } from "@/hooks/useCategories";
import {
  CategoryTable,
  CategorySortKey,
  CategorySortDirection,
} from "@/components/category/CategoryTable";
import { CategorySortDropdown } from "@/components/category/CategorySortDropdown";
import { CategoryFormModal } from "@/components/category/CategoryFormModal";
import { DeleteCategoryModal } from "@/components/category/DeleteCategoryModal";
import { Category, CategoryFormValues } from "@/types/category.types";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopBarContent } from "@/context/TopBarContext";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategoriesList();
  const saveMutation = useSaveCategory();
  const deleteMutation = useDeleteCategory();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<CategorySortKey>("createdAt");
  const [sortDir, setSortDir] = useState<CategorySortDirection>("desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const filteredAndSortedCategories = useMemo(() => {
    let result = categories;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(term) ||
          cat.slug.toLowerCase().includes(term) ||
          (cat.description && cat.description.toLowerCase().includes(term))
      );
    }

    return [...result].sort((a, b) => {
      if (sortKey === "name") {
        const comp = a.name.localeCompare(b.name, "vi");
        return sortDir === "asc" ? comp : -comp;
      }
      if (sortKey === "courseCount") {
        return sortDir === "asc"
          ? a.courseCount - b.courseCount
          : b.courseCount - a.courseCount;
      }
      if (sortKey === "createdAt") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDir === "asc" ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });
  }, [categories, searchTerm, sortKey, sortDir]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    setDeletingCategory(cat);
  };

  const handleSave = (values: CategoryFormValues) => {
    saveMutation.mutate(
      { id: editingCategory?.id, values },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingCategory(null);
        },
      }
    );
  };

  const handleDeleteConfirm = (cat: Category) => {
    deleteMutation.mutate(cat.id, {
      onSuccess: () => {
        setDeletingCategory(null);
      },
    });
  };

  const handleSortChange = (key: CategorySortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/courses"
              className="text-neutral-500 hover:text-purple-700 font-medium transition"
            >
              Khóa học
            </Link>
            <CaretRight size={10} className="text-neutral-400" />
            <span className="font-bold text-neutral-900">Quản lý danh mục</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition hover:bg-neutral-50"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Về danh sách khóa học</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>Thêm danh mục</span>
            </button>
          </div>
        }
      />

      {/* Filter / Search Bar & Sort Tools */}
      <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-neutral-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              <MagnifyingGlass size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục theo tên..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-600 text-neutral-800 transition"
            />
          </div>

          {/* Sort Tool Dropdown */}
          <CategorySortDropdown
            sortKey={sortKey}
            sortDir={sortDir}
            onSelect={(key, dir) => {
              setSortKey(key);
              setSortDir(dir);
            }}
          />
        </div>

        <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">
          Tổng cộng:{" "}
          <strong className="text-neutral-800">
            {filteredAndSortedCategories.length}
          </strong>{" "}
          danh mục
        </span>
      </div>

      {/* Main Table or Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-100 p-6 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <CategoryTable
          categories={filteredAndSortedCategories}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSortChange}
        />
      )}

      {/* Form Modal (Create / Edit) */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSave}
        initialData={editingCategory}
        isSubmitting={saveMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        category={deletingCategory}
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
