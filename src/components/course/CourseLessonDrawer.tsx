import React, { useEffect } from "react";
import Link from "next/link";
import { ExtendedLesson } from "@/hooks/useCourse";
import { X, FilmStrip, Sparkle, CheckSquareOffset, Check } from "@phosphor-icons/react";

interface CourseLessonDrawerProps {
  lesson: ExtendedLesson | null;
  chapterTitle?: string;
  chapterOrder?: number;
  open: boolean;
  onClose: () => void;
}

export function CourseLessonDrawer({
  lesson,
  chapterTitle,
  chapterOrder = 1,
  open,
  onClose,
}: CourseLessonDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-white shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
              {chapterOrder}.{lesson.order}
            </span>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Chi tiết Bài học</h3>
              <p className="text-[11px] text-neutral-500">
                {chapterTitle || `Chương ${chapterOrder}`} — Bài học Video cốt lõi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition"
            title="Đóng Drawer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-neutral-800">
          {/* Tên bài học */}
          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">
              Tên bài học <span className="text-red-500">*</span>
            </label>
            <div className="p-3 bg-neutral-50 rounded-xl font-semibold text-neutral-900">
              {lesson.title}
            </div>
          </div>

          {/* Mục tiêu bài học */}
          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">Mục tiêu bài học</label>
            <div className="p-3 bg-neutral-50 rounded-xl text-neutral-600 leading-relaxed whitespace-pre-line">
              {lesson.learningObjective ||
                "- Nắm vững lý thuyết cơ sở và các trường hợp áp dụng vào bài toán thực tế.\n- Tương tác với AI Trợ giảng trực tiếp trong video để giải đáp thắc mắc."}
            </div>
          </div>

          {/* Video bài giảng */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <FilmStrip size={16} weight="fill" className="text-purple-600" />
              <span>Video bài giảng</span>
            </span>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
              <div className="w-16 h-11 rounded-lg bg-neutral-800 flex items-center justify-center text-white shrink-0 relative overflow-hidden">
                <FilmStrip size={18} className="text-purple-400" />
                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono bg-black/70 px-1 rounded">
                  {lesson.durationSeconds
                    ? `${Math.floor(lesson.durationSeconds / 60)}:${String(
                        lesson.durationSeconds % 60
                      ).padStart(2, "0")}`
                    : "12:30"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 truncate text-xs">
                  {lesson.videoFileName || "lesson_video.mp4"}
                </p>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  {lesson.fileSizeMb || 128} MB <span className="text-neutral-300 mx-1">|</span> 1080p 60fps <span className="text-neutral-300 mx-1">|</span> HLS
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <Link
                href="/videos"
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                ↗ Theo dõi tiến trình xử lý video
              </Link>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                <Check size={12} weight="bold" />
                <span>Phụ đề hoàn tất</span>
              </span>
            </div>
          </div>

          {/* Dữ liệu AI Trợ giảng */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Sparkle size={16} weight="fill" className="text-purple-600" />
                <span>Dữ liệu Trợ giảng AI</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">
                Đã đồng bộ AI
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {lesson.transcriptWordCount || 1420} từ • {lesson.vectorChunkCount || 14} đoạn kiến thức • Sẵn sàng cho AI Trợ giảng
            </p>
          </div>

          {/* Bài tập củng cố sau bài */}
          <div className="space-y-2 pt-2">
            <span className="font-bold text-neutral-800 flex items-center gap-1.5">
              <CheckSquareOffset size={16} weight="fill" className="text-purple-600" />
              <span>Bài tập củng cố sau bài</span>
            </span>
            <p className="text-xs font-medium text-neutral-700 bg-neutral-50 p-3 rounded-xl">
              {lesson.quizTitle || "Chưa gắn bài tập củng cố"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-white grad-nebula shadow-nebula text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={14} weight="bold" />
            <span>Hoàn tất xem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
