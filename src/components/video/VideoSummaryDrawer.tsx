"use client";

import { useEffect } from "react";
import {
  BookmarkSimple,
  Clock,
  Sparkle,
} from "@phosphor-icons/react";
import type { VideoListItem } from "@/types/video.types";

interface VideoSummaryDrawerProps {
  video: VideoListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoSummaryDrawer({ video, isOpen, onClose }: VideoSummaryDrawerProps) {
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

  if (!isOpen || !video) return null;

  return (
    <>
      <style>{`
        @keyframes drawerSlideUp {
          0% {
            transform: translateY(100%);
            opacity: 0.5;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes drawerFadeIn {
          0% {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          100% {
            opacity: 1;
            backdrop-filter: blur(6px);
          }
        }
      `}</style>
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm flex items-end justify-center z-50"
        style={{
          animation: "drawerFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl max-h-[85vh] bg-white rounded-t-[28px] shadow-2xl border-t border-purple-200 flex flex-col relative z-20"
          style={{
            animation: "drawerSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="w-full pt-2.5 pb-1 flex justify-center shrink-0 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition" />
        </div>

        <div className="px-6 py-3.5 flex items-center justify-between border-b border-neutral-100 bg-purple-50/50 rounded-t-[24px] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl grad-nebula flex items-center justify-center text-white shadow-xs">
              <Sparkle size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <span>EduAI Tóm tắt bài giảng</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                  Tự động tạo
                </span>
              </h3>
              <p className="text-xs text-neutral-500 font-medium truncate max-w-lg">
                {video.videoTitle || video.lessonTitle} {video.courseTitle ? `• ${video.courseTitle}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl flex items-start gap-3">
            <Sparkle size={16} weight="fill" className="text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-purple-950">Tổng quan nội dung chính</p>
              <p className="text-neutral-700 leading-relaxed">
                Bài học này hướng dẫn các khái niệm nền tảng, thiết lập môi trường và cấu trúc dữ liệu cốt lõi. Học viên sẽ nắm được cách ứng dụng thực chiến qua các ví dụ mã nguồn mẫu kèm chú thích chi tiết.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-purple-600" />
              <span>Mốc thời gian &amp; Điểm kiến thức quan trọng</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 bg-neutral-50 hover:bg-purple-50/40 border border-neutral-200/80 rounded-xl transition flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono font-bold text-[11px] tabular-nums">
                      00:00 - 03:15
                    </span>
                    <span className="font-bold text-neutral-900">1. Giới thiệu mục tiêu và cấu trúc bài</span>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Tổng kết lộ trình học, chuẩn bị công cụ và thiết lập môi trường thực hành.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 hover:bg-purple-50/40 border border-neutral-200/80 rounded-xl transition flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono font-bold text-[11px] tabular-nums">
                      03:16 - 08:45
                    </span>
                    <span className="font-bold text-neutral-900">2. Khái niệm cốt lõi &amp; Phân tích ví dụ mẫu</span>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Đi sâu vào các phương thức xử lý dữ liệu, tối ưu hóa vòng lặp và xử lý ngoại lệ an toàn.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 hover:bg-purple-50/40 border border-neutral-200/80 rounded-xl transition flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono font-bold text-[11px] tabular-nums">
                      08:46 - {video.durationSec ? `${Math.floor(video.durationSec / 60)}:${String(video.durationSec % 60).padStart(2, "0")}` : "12:30"}
                    </span>
                    <span className="font-bold text-neutral-900">3. Thực hành &amp; Bài tập củng cố</span>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Viết mã thực tế, kiểm tra đầu ra và các lưu ý tránh bẫy lỗi thường gặp khi triển khai hệ thống.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <BookmarkSimple size={16} className="text-purple-600" />
              <span>Ghi chú quan trọng cho giảng viên</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 leading-relaxed text-[11px]">
              <li>Bản tóm tắt này được hệ thống tự động trích xuất từ âm thanh bài giảng.</li>
              <li>Giảng viên có thể duyệt lại toàn văn phụ đề tại màn hình Duyệt phụ đề để đảm bảo độ chính xác tuyệt đối.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-neutral-500">
            Hạn mức tạo tóm tắt: <strong className="text-neutral-800">Không giới hạn</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

