"use client";

import React, { useEffect } from "react";
import { Warning, X, Trash, ShieldWarning } from "@phosphor-icons/react";
import { Instructor } from "@/types/instructor.types";
import { Button } from "@/components/ui/Button";

interface DeleteInstructorModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (instructor: Instructor) => void;
  isDeleting?: boolean;
}

export function DeleteInstructorModal({
  instructor,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteInstructorModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !instructor) return null;

  const hasCourses = instructor.courseCount > 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 mx-4 animate-in zoom-in-95 duration-150 space-y-5">
        <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-xs ${
                hasCourses
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}
            >
              {hasCourses ? (
                <ShieldWarning size={24} weight="bold" />
              ) : (
                <Trash size={24} weight="bold" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {hasCourses ? "Không thể xóa giảng viên" : "Xác nhận xóa giảng viên?"}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {hasCourses
                  ? "Ràng buộc dữ liệu khóa học"
                  : "Hành động này sẽ xóa vĩnh viễn hồ sơ khỏi hệ thống"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
            title="Đóng"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {hasCourses ? (
          <div className="space-y-3 font-sans text-xs text-neutral-600 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
              Giảng viên <strong className="font-bold text-amber-950">{instructor.fullName}</strong> hiện đang phụ trách{" "}
              <strong className="font-mono font-bold text-amber-950">{instructor.courseCount}</strong> khóa học đang phát hành.
            </div>
            <p className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
              Theo quy định toàn vẹn dữ liệu, không thể xóa giảng viên khi chưa chuyển giao khóa học cho người khác.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-neutral-600 font-sans leading-relaxed">
            <p>
              Bạn có chắc chắn muốn xóa hồ sơ của giảng viên{" "}
              <strong className="text-neutral-900 font-bold">{instructor.fullName}</strong>?
            </p>
            <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl text-rose-800 text-[11px] flex items-center gap-2 font-medium">
              <Warning size={16} className="shrink-0 text-rose-600" weight="bold" />
              <span>Dữ liệu hồ sơ sau khi xóa sẽ không thể phục hồi lại.</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button
            variant="outlined"
            size="sm"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl text-xs font-semibold"
          >
            {hasCourses ? "Đã hiểu" : "Hủy bỏ"}
          </Button>

          {!hasCourses && (
            <Button
              variant="destructive"
              size="sm"
              loading={isDeleting}
              onClick={() => onConfirm(instructor)}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Trash size={16} weight="bold" />
              <span>Xóa hồ sơ</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
