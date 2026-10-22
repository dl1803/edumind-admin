import React from "react";
import { Users, Folders, FilmStrip, Clock } from "@phosphor-icons/react";

interface EnrollmentStatsProps {
  studentCount?: number;
  chapterCount?: number;
  lessonCount?: number;
  totalDurationHours?: number;
}

export function EnrollmentStats({
  studentCount,
  chapterCount,
  lessonCount,
  totalDurationHours,
}: EnrollmentStatsProps) {
  const formatNumber = (num?: number, suffix = "") => {
    if (typeof num !== "number" || isNaN(num)) return "—";
    return `${num.toLocaleString("vi-VN")}${suffix}`;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xs grid grid-cols-2 gap-3">
      <div className="p-3 rounded-xl bg-purple-50/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg shrink-0">
          <Users size={20} weight="fill" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-neutral-900 font-mono">
            {formatNumber(studentCount)}
          </p>
          <p className="text-[10px] text-neutral-500 font-medium truncate">Học viên ghi danh</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-50/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg shrink-0">
          <Folders size={20} weight="fill" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-neutral-900 font-mono">
            {formatNumber(chapterCount, " chương")}
          </p>
          <p className="text-[10px] text-neutral-500 font-medium truncate">Cấu trúc bài giảng</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-blue-50/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0">
          <FilmStrip size={20} weight="fill" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-neutral-900 font-mono">
            {formatNumber(lessonCount, " bài")}
          </p>
          <p className="text-[10px] text-neutral-500 font-medium truncate">Bài giảng video</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-50/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0">
          <Clock size={20} weight="fill" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-neutral-900 font-mono">
            {typeof totalDurationHours === "number" ? `${totalDurationHours} giờ` : "—"}
          </p>
          <p className="text-[10px] text-neutral-500 font-medium truncate">Tổng thời lượng</p>
        </div>
      </div>
    </div>
  );
}
