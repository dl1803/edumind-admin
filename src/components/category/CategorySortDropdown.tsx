"use client";

import React from "react";
import { CategorySortKey, CategorySortDirection } from "./CategoryTable";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

export interface SortOption {
  key: CategorySortKey;
  dir: CategorySortDirection;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: "createdAt", dir: "desc", label: "Tạo mới nhất" },
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
      <SelectDropdown
        title="Công cụ sắp xếp danh mục"
        value={`${sortKey}-${sortDir}`}
        options={SORT_OPTIONS.map((opt) => ({
          label: opt.label,
          value: `${opt.key}-${opt.dir}`,
        }))}
        onChange={(val) => {
          const [key, dir] = val.split("-") as [
            CategorySortKey,
            CategorySortDirection
          ];
          onSelect(key, dir);
        }}
      />
    </div>
  );
}
