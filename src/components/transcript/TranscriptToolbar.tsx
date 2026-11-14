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
}

export function TranscriptToolbar({
  keyword,
  onKeywordChange,
  totalSegments,
  totalWords,
  autoScroll,
  onAutoScrollChange,
  isEdited = false,
}: TranscriptToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 bg-purple-50/20 p-4 shrink-0">
      <div className="flex flex-1 items-center gap-3 min-w-[240px]">
        {/* Ô tìm kiếm trong phụ đề */}
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm từ khóa trong phụ đề..."
            aria-label="Tìm kiếm trong phụ đề"
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

        {/* Toggle Tự động cuộn theo video */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => onAutoScrollChange(e.target.checked)}
            className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
          />
          <span>Tự động cuộn</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        {/* THỐNG KÊ SỐ ĐOẠN VÀ TỪ */}
        <span className="text-[11px] text-neutral-500 font-sans">
          <strong className="text-neutral-900 font-mono tabular-nums font-semibold">
            {totalSegments}
          </strong>{" "}
          đoạn <span className="text-neutral-300 mx-1">|</span>{" "}
          <strong className="text-neutral-900 font-mono tabular-nums font-semibold">
            {totalWords.toLocaleString("vi-VN")}
          </strong>{" "}
          từ
        </span>

        {/* BADGE NGUỒN PHỤ ĐỀ */}
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
            isEdited
              ? "text-amber-800 bg-amber-50 border-amber-200"
              : "text-purple-700 bg-purple-50 border-purple-200"
          }`}
        >
          {isEdited ? "Đã có chỉnh sửa" : "Bản nhận diện tự động"}
        </span>
      </div>
    </div>
  );
}
