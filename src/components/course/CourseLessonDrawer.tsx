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

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-white shadow-2xl z-40 flex flex-col border-l border-purple-100">
        <div className="p-5 border-b border-purple-100 bg-purple-50/40 flex items-center justify-between shrink-0">
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
            className="w-8 h-8 rounded-lg hover:bg-purple-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition"
            title="Đóng Drawer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-neutral-800">
          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">
              Tên bài học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={lesson.title}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-semibold text-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">Mục tiêu bài học</label>
            <textarea
              rows={2}
              readOnly
              value={
                lesson.learningObjective ||
                "- Nắm vững lý thuyết cơ sở và các trường hợp áp dụng vào bài toán thực tế.\n- Tương tác với AI Trợ giảng trực tiếp trong video để giải đáp thắc mắc."
              }
              className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 font-sans leading-relaxed resize-none focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-100 pb-2">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <FilmStrip size={16} weight="fill" className="text-purple-600" />
                <span>Video bài giảng</span>
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
              <div className="w-20 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-white shrink-0 relative overflow-hidden">
                <FilmStrip size={20} className="text-purple-400" />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/70 px-1 rounded">
                  {lesson.durationSeconds
                    ? `${Math.floor(lesson.durationSeconds / 60)}:${String(
                        lesson.durationSeconds % 60
                      ).padStart(2, "0")}`
                    : "12:30"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-neutral-900 truncate text-xs">
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
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <Check size={12} weight="bold" />
                <span>Whisper STT Hoàn tất</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Sparkle size={16} weight="fill" className="text-purple-600" />
                <span>Dữ liệu AI Trợ giảng (RAG Ready)</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                pgvector Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lesson.transcriptWordCount || 1420} từ • {lesson.vectorChunkCount || 14} chunks vector • Sẵn sàng cho AI Q&amp;A
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <CheckSquareOffset size={16} weight="fill" className="text-purple-600" />
                <span>Bài tập củng cố sau bài</span>
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
              {lesson.quizTitle || "Chưa gắn bài tập củng cố"}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-purple-100 bg-neutral-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-white transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-white grad-nebula shadow-nebula text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5"
          >
            <Check size={14} weight="bold" />
            <span>Hoàn tất xem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
