"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  CaretDown,
  Check,
  CloudArrowUp,
  FilmStrip,
  Sparkle,
  VideoCamera,
  X,
} from "@phosphor-icons/react";

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadVideoModal({ isOpen, onClose }: UploadVideoModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[580px] max-w-full bg-white rounded-2xl p-6 shadow-2xl border border-purple-100 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
              <CloudArrowUp size={22} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Tải lên video bài giảng mới</h3>
              <p className="text-[11px] text-neutral-500">
                Mỗi video được gán trực tiếp vào một bài học và kích hoạt pipeline xử lý AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Khóa học <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-900 focus:outline-none focus:border-purple-600 text-xs appearance-none cursor-pointer">
                  <option>Nhập môn Lập trình Python</option>
                  <option>Xây dựng Ứng dụng RAG Thông minh</option>
                  <option>Thiết kế Giao diện UI/UX Nâng cao</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Gán vào bài học <span className="text-red-500">*</span> (1 bài/video)
              </label>
              <div className="relative">
                <select className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-900 focus:outline-none focus:border-purple-600 text-xs appearance-none cursor-pointer">
                  <option>Bài 2.4: Tối ưu Câu lệnh Prompt</option>
                  <option>Bài 2.5: Kiểm thử Hệ thống AI</option>
                  <option>Bài 1.3: Cú pháp Hàm nâng cao</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <Link
            href="/videos/upload"
            className="p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-purple-50/30 flex flex-col items-center justify-center text-center cursor-pointer transition block group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform">
              <VideoCamera size={24} weight="bold" />
            </div>
            <p className="text-xs font-bold text-neutral-900">
              Kéo và thả file video vào đây, hoặc{" "}
              <span className="text-purple-700 underline font-bold">duyệt từ máy tính</span>
            </p>
            <p className="text-[10px] text-neutral-500 mt-1 font-sans">
              Định dạng hỗ trợ: MP4, MOV, AVI, MKV, WEBM (Dung lượng tối đa 5GB)
            </p>
          </Link>

          <div className="space-y-2">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <FilmStrip size={16} weight="fill" className="text-purple-600 shrink-0" />
                  <span className="font-bold text-neutral-900 truncate">
                    lesson_2_4_prompt_optimization.mp4
                  </span>
                  <span className="text-neutral-500 font-sans tabular-nums shrink-0">380 MB</span>
                </div>
                <span className="font-bold text-purple-700 font-sans tabular-nums shrink-0">
                  72% (4.2 MB/s)
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full grad-nebula rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 flex items-center gap-2 text-[11px] text-purple-700 font-medium">
            <Sparkle size={16} weight="fill" className="text-purple-600 shrink-0" />
            <span>Pipeline 4 bước (Mã hóa HLS, Whisper STT &amp; Vector Index) sẽ tự động chạy ngầm.</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 gap-3">
            <span
              className="text-[11px] text-neutral-400 truncate max-w-[210px] block"
              title="Tiến trình xử lý sẽ tự động chạy ngầm trên máy chủ."
            >
              Tiến trình xử lý sẽ tự động chạy ngầm trên máy chủ.
            </span>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition text-xs cursor-pointer whitespace-nowrap"
              >
                Hủy
              </button>
              <Link
                href="/videos/upload"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-white grad-nebula font-semibold shadow-nebula hover:opacity-95 transition inline-flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0"
              >
                <Check size={14} weight="bold" />
                <span>Bắt đầu tải lên &amp; Chạy Pipeline</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

