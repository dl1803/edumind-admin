import React from "react";
import { FolderOpen, MagnifyingGlass, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export interface DataTableEmptyProps {
  isFiltered: boolean;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onResetFilters?: () => void;
  colSpan: number;
}

export function DataTableEmpty({
  isFiltered,
  title,
  description,
  action,
  onResetFilters,
  colSpan,
}: DataTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            {isFiltered ? <MagnifyingGlass size={24} /> : <FolderOpen size={24} />}
          </div>

          <h3 className="text-sm font-semibold text-neutral-900 mb-1">
            {title || (isFiltered ? "Không tìm thấy kết quả" : "Chưa có dữ liệu")}
          </h3>

          <p className="text-xs text-neutral-500 mb-4">
            {description ||
              (isFiltered
                ? "Không tìm thấy bản ghi nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại."
                : "Hệ thống chưa ghi nhận bản ghi nào trong danh mục này.")}
          </p>

          {isFiltered && onResetFilters ? (
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={onResetFilters}
              leftIcon={<ArrowCounterClockwise size={14} />}
              className="text-xs"
            >
              Xóa bộ lọc
            </Button>
          ) : (
            action
          )}
        </div>
      </td>
    </tr>
  );
}
