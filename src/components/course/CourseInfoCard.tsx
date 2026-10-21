import React from "react";
import Image from "next/image";
import { CourseDetailExtended } from "@/hooks/useCourse";
import { EnrollmentStats } from "./EnrollmentStats";
import { StatusText } from "@/components/ui/StatusText";
import { ChalkboardTeacher, Check, EyeSlash, Code } from "@phosphor-icons/react";

interface CourseInfoCardProps {
  course: CourseDetailExtended;
  onTogglePublish?: () => void;
}

export function CourseInfoCard({ course, onTogglePublish }: CourseInfoCardProps) {
  const formatPrice = (val?: number) => {
    if (typeof val !== "number" || isNaN(val)) return "—";
    return `${val.toLocaleString("vi-VN")}đ`;
  };

  return (
    <div className="grid grid-cols-12 gap-6 max-w-5xl mx-auto">
      <div className="col-span-12 lg:col-span-5 space-y-5">
        <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
          {course.thumbnailUrl ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-purple-50">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white p-4 text-center shadow-inner relative">
              <Code size={40} weight="fill" className="mb-1 drop-shadow-md text-white/90" />
              <h3 className="font-bold text-sm drop-shadow-md line-clamp-1">{course.title}</h3>
              <p className="text-[10px] text-white/80 mt-0.5">EduMind E-Learning Portal</p>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-50 pb-2">
            <ChalkboardTeacher size={16} weight="fill" className="text-purple-600" />
            <span>Giảng viên phụ trách</span>
          </h4>
          <div>
            <h5 className="text-xs font-bold text-neutral-900">{course.instructorName}</h5>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">Khoa Công nghệ Thông tin</p>
            <p className="text-[10px] text-neutral-400 mt-1 font-mono">
              giangvien@edumind.vn <span className="text-neutral-300 mx-1">|</span> Giảng viên cơ hữu
            </p>
          </div>
          <p className="text-[11px] text-neutral-600 leading-relaxed bg-purple-50/40 p-2.5 rounded-xl border border-purple-100">
            Giảng viên chuyên môn chịu trách nhiệm biên soạn đề cương, ghi hình bài giảng và kiểm duyệt ngân hàng câu hỏi AI.
          </p>
        </div>

        <EnrollmentStats
          studentCount={course.studentCount}
          chapterCount={course.chapterCount}
          lessonCount={course.lessonCount}
          totalDurationHours={course.totalDurationHours}
        />
      </div>

      <div className="col-span-12 lg:col-span-7 space-y-5">
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                {course.categoryName || "Chung"}
              </span>
              <StatusText status={course.status} />
            </div>

            {onTogglePublish && (
              <button
                type="button"
                onClick={onTogglePublish}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-1.5 transition shadow-2xs"
              >
                <EyeSlash size={14} />
                <span>{course.status === "PUBLISHED" ? "Tạm ẩn khóa học" : "Xuất bản khóa học"}</span>
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-neutral-900 leading-snug">
            {course.title}
          </h2>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                Giá bán chính thức
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-neutral-900 font-mono">
                  {formatPrice(course.priceVnd)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                Doanh thu tích lũy (ước tính)
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {formatPrice(course.accumulatedRevenueVnd)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                Mô tả khóa học
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                {course.description || "Chưa có mô tả cho khóa học này."}
              </p>
            </div>

            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h5 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Mục tiêu &amp; Chuẩn đầu ra
                </h5>
                <ul className="space-y-2 text-xs text-neutral-600">
                  {course.learningOutcomes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check size={14} weight="bold" className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h5 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Yêu cầu tham gia
                </h5>
                <ul className="space-y-2 text-xs text-neutral-600">
                  {course.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-slate-400 pt-3 text-right">
              Khởi tạo ngày{" "}
              {course.createdAt
                ? new Date(course.createdAt).toLocaleDateString("vi-VN")
                : "14/08/2026"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
