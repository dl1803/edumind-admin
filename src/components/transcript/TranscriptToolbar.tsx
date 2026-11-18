"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";

interface TranscriptToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  totalSegments: number;
  totalWords: number;
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  isEdited?: boolean;
  editedCount?: number;
  isEditing?: boolean;
  statusLabel?: string;
  statusVariant?: "amber" | "purple" | "neutral";
}

export function TranscriptToolbar({
  keyword,
  onKeywordChange,
  totalSegments,
  totalWords,
  autoScroll,
  onAutoScrollChange,
  isEdited = false,
  editedCount,
  isEditing = false,
  statusLabel,
  statusVariant,
}: TranscriptToolbarProps) {
  const resolvedLabel =
    statusLabel ?? (isEdited ? "Đã có chỉnh sửa" : "Bản nhận diện tự động");

  const resolvedVariant =
    statusVariant ?? (isEdited ? "amber" : "purple");

  const badgeClass =
    resolvedVariant === "amber"
      ? "text-amber-800 bg-amber-50 border-amber-200"
      : resolvedVariant === "neutral"
      ? "text-neutral-600 bg-neutral-100 border-neutral-200"
      : "text-purple-700 bg-purple-50 border-purple-200";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-purple-100 bg-purple-50/20 p-3.5 sm:p-4 shrink-0 overflow-hidden">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative w-44 sm:w-52">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={
              isEditing
                ? "Tìm từ khóa (tô sáng)..."
                : "Tìm từ khóa trong phụ đề..."
            }
            aria-label="Tìm kiếm trong phụ đề"
            title={
              isEditing
                ? "Đang ở chế độ chỉnh sửa: tìm kiếm chỉ tô sáng từ khóa, không ẩn đoạn"
                : undefined
            }
            className="w-full rounded-xl border border-neutral-200 bg-white py-1.5 pl-8 pr-8 text-xs text-neutral-800 transition focus:border-purple-500 focus:outline-none"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => onKeywordChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 transition hover:text-neutral-700"
            >
              <X size={12} weight="bold" />
            </button>
          )}
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-neutral-600 select-none shrink-0">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => onAutoScrollChange(e.target.checked)}
            className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
          />
          <span>Tự động cuộn</span>
        </label>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        <span className="text-[11px] text-neutral-500 font-sans whitespace-nowrap">
          <strong className="text-neutral-900 font-mono tabular-nums font-semibold">
            {totalSegments}
          </strong>{" "}
          đoạn <span className="text-neutral-300 mx-1">|</span>{" "}
          <strong className="text-neutral-900 font-mono tabular-nums font-semibold">
            {totalWords.toLocaleString("vi-VN")}
          </strong>{" "}
          từ
          {editedCount !== undefined && editedCount > 0 && (
            <>
              <span className="text-neutral-300 mx-1">|</span>{" "}
              <strong className="text-amber-700 font-mono tabular-nums font-semibold">
                {editedCount}
              </strong>{" "}
              đã sửa
            </>
          )}
        </span>

        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap shrink-0 ${badgeClass}`}>
          {resolvedLabel}
        </span>
      </div>
    </div>
  );
}
