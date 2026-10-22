import React from "react";
import Image from "next/image";
import { CourseDetailExtended } from "@/hooks/useCourse";
import { EnrollmentStats } from "./EnrollmentStats";
import { StatusText } from "@/components/ui/StatusText";
import { ChalkboardTeacher, Check, Code } from "@phosphor-icons/react";

interface CourseInfoCardProps {
  course: CourseDetailExtended;
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
  const formatPrice = (val?: number) => {
    if (typeof val !== "number" || isNaN(val)) return "—";
    return `${val.toLocaleString("vi-VN")}đ`;
  };

  const formattedDate = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString("vi-VN")
    : "14/08/2026";

  return (
    <div className="grid grid-cols-12 gap-6 max-w-5xl mx-auto">
      {/* CỘT TRÁI (5 CỘT) */}
      <div className="col-span-12 lg:col-span-5 space-y-5">
        {/* Ảnh bìa */}
        <div className="bg-white p-3 rounded-2xl shadow-xs">
          {course.thumbnailUrl ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden relative">
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

        {/* Giảng viên phụ trách */}
        <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 pb-1">
            <ChalkboardTeacher size={16} weight="fill" className="text-purple-600" />
            <span>Giảng viên phụ trách</span>
          </h4>
          <div>
            <h5 className="text-sm font-bold text-neutral-900">
              {course.instructorName || "Chưa phân công"}
            </h5>
            <p className="text-xs text-neutral-500 mt-0.5">
              {course.instructorTitle || "Khoa Công nghệ Thông tin, Đại học Quốc gia Hà Nội"}
            </p>
          </div>
        </div>

        {/* Thống kê 4 số liệu */}
        <EnrollmentStats
          studentCount={course.studentCount}
          chapterCount={course.chapterCount}
          lessonCount={course.lessonCount}
          totalDurationHours={course.totalDurationHours}
        />
      </div>

      {/* CỘT PHẢI (7 CỘT) */}
      <div className="col-span-12 lg:col-span-7">
        <div className="bg-white p-6 rounded-2xl shadow-xs space-y-5">
          {/* Hàng đầu: Danh mục */}
          <div>
            <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px]">
              {course.categoryName || "Chung"}
            </span>
          </div>

          {/* Tên khóa học */}
          <h2 className="text-xl font-bold text-neutral-900 leading-snug">
            {course.title}
          </h2>

          {/* Giá bán và doanh thu (phẳng, tinh tế, không đóng khung hộp dày) */}
          <div className="flex items-center justify-between py-2 border-y border-neutral-100">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                Giá bán chính thức
              </span>
              <span className="text-2xl font-black text-neutral-900 font-mono mt-0.5 block">
                {formatPrice(course.priceVnd)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                Doanh thu tích lũy (ước tính)
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                {formatPrice(course.accumulatedRevenueVnd)}
              </span>
            </div>
          </div>

          {/* Mô tả, mục tiêu, yêu cầu */}
          <div className="space-y-4 pt-1">
            <div>
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                Mô tả khóa học
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                {course.description || "Chưa có mô tả cho khóa học này."}
              </p>
            </div>

            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-neutral-100">
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
              <div className="space-y-2 pt-3 border-t border-neutral-100">
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
          </div>

          {/* Hàng chân trang: Ngày tạo góc trái, Trạng thái góc phải */}
          <div className="flex items-center justify-between text-xs pt-4 border-t border-neutral-100">
            <span className="text-neutral-400">Khởi tạo ngày {formattedDate}</span>
            <StatusText status={course.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
