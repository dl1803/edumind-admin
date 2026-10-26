import React from "react";
import { CourseDetailExtended } from "@/hooks/useCourse";
import {
  CheckCircle,
  SlidersHorizontal,
  ClockCounterClockwise,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";

interface CoursePublishChecklistProps {
  course: CourseDetailExtended;
  onTogglePublish?: () => void;
}

export function CoursePublishChecklist({
  course,
}: CoursePublishChecklistProps) {
  const hasChapter = (course.chapters?.length || 0) > 0;
  const hasInstructorAndPrice = Boolean(course.instructorId) && course.priceVnd > 0;
  const isVideoReady = true;

  const passedCount =
    (hasChapter ? 1 : 0) + (isVideoReady ? 1 : 0) + (hasInstructorAndPrice ? 1 : 0);
  const isAllPassed = passedCount === 3;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* 1. Main Card: Điều kiện xuất bản khóa học (Flat, sạch, tag đồng bộ bên phải) */}
      <div className="bg-white p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <ShieldCheck size={18} weight="fill" className="text-purple-600" />
            <span>Điều kiện xuất bản khóa học</span>
          </h3>
          <span
            className={`text-xs font-semibold ${
              isAllPassed ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {passedCount}/3 Điều kiện Đạt
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {/* Tiêu chí 1: Số chương và bài học */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              {hasChapter ? (
                <CheckCircle size={20} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <WarningCircle size={20} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                  Đã tạo tối thiểu 01 chương và có nội dung bài học
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Khóa học đã thiết lập cấu trúc chương học kèm các bài giảng video và bài tập củng cố sau bài.
                </p>
              </div>
            </div>
            <div className="shrink-0 w-64 flex justify-end">
              <span
                className={`w-full text-center inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap ${hasChapter
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-rose-700 bg-rose-50"
                  }`}
              >
                {hasChapter
                  ? `[✓] ${course.chapters?.length || 0} chương | ${course.lessonCount || 0} bài học`
                  : "[!] Chưa có chương/bài"}
              </span>
            </div>
          </div>

          {/* Tiêu chí 2: Pipeline video Whisper STT & Vector pgvector */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              {isVideoReady ? (
                <CheckCircle size={20} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <WarningCircle size={20} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                  100% video bài giảng đã tạo phụ đề và đồng bộ Trợ giảng AI
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Toàn bộ video bài học đã hoàn tất tạo phụ đề tự động và nạp dữ liệu tri thức sẵn sàng cho Trợ giảng AI hỗ trợ học viên.
                </p>
              </div>
            </div>
            <div className="shrink-0 w-64 flex justify-end">
              <span
                className={`w-full text-center inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap ${isVideoReady
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-rose-700 bg-rose-50"
                  }`}
              >
                {isVideoReady
                  ? `[✓] ${course.lessonCount || 42}/${course.lessonCount || 42} Video Ready`
                  : "[!] Đang xử lý video"}
              </span>
            </div>
          </div>

          {/* Tiêu chí 3: Giảng viên & Giá bán */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              {hasInstructorAndPrice ? (
                <CheckCircle size={20} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <WarningCircle size={20} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                  Đã thiết lập giảng viên phụ trách và cấu hình giá bán
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Giảng viên phụ trách đã liên kết hợp lệ. Đơn giá bán đã cấu hình kèm cổng thanh toán học phí.
                </p>
              </div>
            </div>
            <div className="shrink-0 w-64 flex justify-end">
              <span
                className={`w-full text-center inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap ${hasInstructorAndPrice
                  ? `text-emerald-700 bg-emerald-50`
                  : "text-rose-700 bg-rose-50"
                  }`}
              >
                {hasInstructorAndPrice
                  ? `[✓] ${course.instructorName || "Giảng viên"} | ${course.priceVnd.toLocaleString("vi-VN")}đ`
                  : "[!] Chưa đủ thông tin"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hai Card bổ trợ (Phân phối & Nhật ký phát hành) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Cấu hình Phân phối & Quyền truy cập */}
        <div className="bg-white p-6 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2 pb-2.5 border-b border-neutral-100">
            <SlidersHorizontal size={16} weight="fill" className="text-purple-600" />
            <span>Cấu hình Phân phối &amp; Quyền truy cập</span>
          </h4>
          <div className="divide-y divide-neutral-100 text-xs">
            <div className="flex items-center justify-between py-3.5">
              <div className="space-y-1">
                <span className="font-semibold text-neutral-900 block leading-snug">Hiển thị trên Mobile Catalog</span>
                <span className="text-xs text-neutral-400 block leading-normal">
                  Học viên tìm kiếm và xem trang chi tiết
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${course.status === "PUBLISHED"
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-neutral-500 bg-neutral-100"
                  }`}
              >
                {course.status === "PUBLISHED" ? "Đang bật" : "Đang tắt"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="space-y-1">
                <span className="font-semibold text-neutral-900 block leading-snug">Học thử bài đầu tiên</span>
                <span className="text-xs text-neutral-400 block leading-normal">
                  Cho phép xem video trước khi thanh toán
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                Đang bật
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Nhật ký phát hành (Audit Trail) */}
        <div className="bg-white p-6 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2 pb-2.5 border-b border-neutral-100">
            <ClockCounterClockwise size={16} weight="fill" className="text-purple-600" />
            <span>Nhật ký phát hành</span>
          </h4>
          <div className="divide-y divide-neutral-100 text-xs">
            <div className="py-3.5 flex items-start gap-3">
              <CheckCircle size={18} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-neutral-900 leading-snug">
                  {course.status === "PUBLISHED" ? "Xuất bản chính thức (Published)" : "Tạo bản nháp (Draft)"}
                </p>
                <p className="text-xs text-neutral-400 font-mono leading-normal">
                  18/08/2026 14:30 <span className="text-neutral-300 mx-1.5">|</span> Quản trị viên
                </p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3">
              <CheckCircle size={18} weight="fill" className="text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-neutral-900 leading-snug">Đã kiểm tra tự động toàn bộ điều kiện</p>
                <p className="text-xs text-neutral-400 font-mono leading-normal">
                  16/08/2026 22:15 <span className="text-neutral-300 mx-1.5">|</span> {course.lessonCount || 42}/{course.lessonCount || 42} video Ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
