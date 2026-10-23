"use client";

import React from "react";
import { CategorySortKey, CategorySortDirection } from "./CategoryTable";

export interface SortOption {
  key: CategorySortKey;
  dir: CategorySortDirection;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: "createdAt", dir: "desc", label: "Mới tạo nhất" },
  { key: "createdAt", dir: "asc", label: "Cũ nhất" },
  { key: "name", dir: "asc", label: "Tên danh mục (A-Z)" },
  { key: "name", dir: "desc", label: "Tên danh mục (Z-A)" },
  { key: "courseCount", dir: "desc", label: "Số khóa học (Nhiều nhất)" },
  { key: "courseCount", dir: "asc", label: "Số khóa học (Ít nhất)" },
];

interface CategorySortDropdownProps {
  sortKey: CategorySortKey;
  sortDir: CategorySortDirection;
  onSelect: (key: CategorySortKey, dir: CategorySortDirection) => void;
}

export function CategorySortDropdown({
  sortKey,
  sortDir,
  onSelect,
}: CategorySortDropdownProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium select-none">
      <span className="text-neutral-500">Sắp xếp:</span>
      <select
        value={`${sortKey}-${sortDir}`}
        onChange={(e) => {
          const [key, dir] = e.target.value.split("-") as [
            CategorySortKey,
            CategorySortDirection
          ];
          onSelect(key, dir);
        }}
        title="Công cụ sắp xếp danh mục"
        className="py-1.5 px-3 text-xs bg-neutral-50 hover:bg-white border border-neutral-200 rounded-xl text-neutral-800 font-medium focus:outline-none focus:border-purple-600 cursor-pointer transition shadow-2xs"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={`${opt.key}-${opt.dir}`} value={`${opt.key}-${opt.dir}`}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
