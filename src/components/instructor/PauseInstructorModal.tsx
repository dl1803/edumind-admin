"use client";

import React, { useState, useEffect } from "react";
import { Warning, X, BookOpen, ShieldWarning, PauseCircle } from "@phosphor-icons/react";
import { Instructor } from "@/types/instructor.types";
import { Button } from "@/components/ui/Button";

interface PauseInstructorModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (instructor: Instructor) => void;
  isPending?: boolean;
}

const SAMPLE_AFFECTED_COURSES = [
  { id: "c1", title: "Lập trình Python chuyên sâu từ cơ bản đến nâng cao", enrolledCount: 1250 },
  { id: "c2", title: "Xử lý ngôn ngữ tự nhiên với Transformers & LLM", enrolledCount: 840 },
  { id: "c3", title: "Kỹ thuật Prompting & RAG căn bản", enrolledCount: 410 },
];

export function PauseInstructorModal({
  instructor,
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}: PauseInstructorModalProps) {
  const [hasConfirmed, setHasConfirmed] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setHasConfirmed(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isPending]);

  if (!isOpen || !instructor) return null;

  const affectedCourses = SAMPLE_AFFECTED_COURSES.slice(
    0,
    Math.max(1, Math.min(instructor.courseCount, 3))
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
      className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-[580px] bg-white rounded-2xl border border-amber-200/80 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 select-none">
        <div className="flex items-start gap-4 pb-4 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl shrink-0">
            <Warning size={26} weight="bold" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-neutral-900">
              Xác nhận tạm dừng cộng tác giảng viên
            </h3>
            <p className="text-xs text-neutral-600 font-sans">
              Hồ sơ giảng viên <strong className="text-neutral-900">{instructor.fullName}</strong> hiện đang được phân công phụ trách giảng dạy trực tiếp.
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldWarning size={16} className="text-amber-600" weight="bold" />
              <span>
                Khóa học đang hoạt động bị ảnh hưởng (
                <span className="font-mono tabular-nums font-bold">
                  {instructor.courseCount || affectedCourses.length}
                </span>{" "}
                khóa học):
              </span>
            </div>

            <div className="space-y-2 pt-1 border-t border-amber-200/50">
              {affectedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-2 text-xs text-amber-900 font-sans"
                >
                  <BookOpen size={16} className="text-amber-600 shrink-0" weight="fill" />
                  <span className="flex-1 font-medium truncate">{course.title}</span>
                  <span className="text-amber-700 font-normal shrink-0">
                    (
                    <span className="font-mono tabular-nums font-semibold">
                      {course.enrolledCount.toLocaleString("vi-VN")}
                    </span>{" "}
                    học viên)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-700 leading-relaxed font-sans bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
            Khi tạm dừng hợp tác, hồ sơ giảng viên này sẽ không thể phân công cho các khóa học mới. Các khóa học hiện tại vẫn duy trì hoạt động bình thường và học viên tiếp tục học tập với sự đồng hành của AI Trợ giảng.
          </p>

          <label className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-neutral-50 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-purple-600 border-neutral-300 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-xs text-neutral-700 font-medium font-sans leading-snug">
              Tôi đã kiểm tra kế hoạch bàn giao và xác nhận tạm dừng hồ sơ này.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button
            variant="outlined"
            size="sm"
            disabled={isPending}
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-4 py-2"
          >
            Hủy bỏ
          </Button>

          <button
            type="button"
            disabled={!hasConfirmed || isPending}
            onClick={() => onConfirm(instructor)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PauseCircle size={16} weight="bold" />
            <span>{isPending ? "Đang xử lý..." : "Xác nhận tạm dừng"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

