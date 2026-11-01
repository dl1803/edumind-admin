"use client";

import React from "react";
import { Users, UserCheck, UserMinus, BookOpen } from "@phosphor-icons/react";
import { InstructorStats, InstructorStatus } from "@/types/instructor.types";
import { cn } from "@/lib/utils";

interface InstructorKPICardsProps {
  stats: InstructorStats;
  currentStatusFilter?: InstructorStatus | "";
  onSelectStatusFilter?: (status: InstructorStatus | "") => void;
}

export function InstructorKPICards({
  stats,
  currentStatusFilter = "",
  onSelectStatusFilter,
}: InstructorKPICardsProps) {
  const handleToggle = (status: InstructorStatus | "") => {
    if (!onSelectStatusFilter) return;
    if (currentStatusFilter === status) {
      onSelectStatusFilter("");
    } else {
      onSelectStatusFilter(status);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      <div
        onClick={() => handleToggle("")}
        className={cn(
          "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-purple-600",
          currentStatusFilter === "" && "ring-2 ring-purple-600 shadow-sm"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase">
            Tổng số Giảng viên
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-base">
            <Users size={18} weight="fill" />
          </div>
        </div>
        <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">
          {stats.total}
        </p>
        <div className="mt-2 text-[11px] text-purple-600 font-medium">
          <span>Toàn hệ thống</span>
        </div>
      </div>

      <div
        onClick={() => handleToggle("active")}
        className={cn(
          "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-emerald-600",
          currentStatusFilter === "active" && "ring-2 ring-emerald-600 shadow-sm"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase">
            Đang cộng tác
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
            <UserCheck size={18} weight="fill" />
          </div>
        </div>
        <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">
          {stats.activeCount}
        </p>
        <div className="mt-2 text-[11px] text-emerald-600 font-medium">
          <span>Đang giảng dạy</span>
        </div>
      </div>

      <div
        onClick={() => handleToggle("suspended")}
        className={cn(
          "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-amber-500",
          currentStatusFilter === "suspended" && "ring-2 ring-amber-500 shadow-sm"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase">
            Tạm ngưng cộng tác
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-base">
            <UserMinus size={18} weight="fill" />
          </div>
        </div>
        <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">
          {stats.suspendedCount}
        </p>
        <div className="mt-2 text-[11px] text-amber-600 font-medium">
          <span>Tạm dừng hợp tác</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between border-l-4 border-l-indigo-600">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase">
            Khóa học phụ trách
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
            <BookOpen size={18} weight="fill" />
          </div>
        </div>
        <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">
          {stats.totalCourses}
        </p>
        <div className="mt-2 text-[11px] text-indigo-600 font-medium">
          <span>Đang phụ trách</span>
        </div>
      </div>
    </div>
  );
}
