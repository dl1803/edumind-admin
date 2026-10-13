'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WarningCircle, ArrowsClockwise } from '@phosphor-icons/react';
import { dashboardService } from '@/services/dashboard.service';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RevenueLineChart } from '@/components/dashboard/RevenueLineChart';
import { StudentGrowthBarChart } from '@/components/dashboard/StudentGrowthBarChart';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { PipelineStatusWidget } from '@/components/dashboard/PipelineStatusWidget';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => dashboardService.getOverview(),
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-red-100 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <WarningCircle size={28} weight="fill" />
        </div>
        <h2 className="text-base font-bold text-neutral-900">
          Không thể tải dữ liệu Tổng quan
        </h2>
        <p className="text-xs text-neutral-500 max-w-md mt-1 mb-5">
          {error instanceof Error
            ? error.message
            : 'Đã xảy ra sự cố trong quá trình nạp thông tin thống kê. Vui lòng thử lại.'}
        </p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl grad-nebula text-white text-xs font-bold shadow-brand-glow hover:opacity-95 transition disabled:opacity-50"
        >
          <ArrowsClockwise size={14} className={isFetching ? 'animate-spin' : ''} />
          <span>{isFetching ? 'Đang thử lại...' : 'Thử lại ngay'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-label="KPI Thống kê">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {data.kpis.map((stat) => (
            <KpiCard key={stat.key} stat={stat} />
          ))}
        </div>
      </section>

      <section aria-label="Biểu đồ xu hướng" className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <RevenueLineChart
            data={data.revenueTrend.data}
            averagePerDay={data.revenueTrend.averagePerDay}
            completionRate={data.revenueTrend.completionRate}
          />
        </div>
        <div className="xl:col-span-5">
          <StudentGrowthBarChart
            data={data.studentGrowth.data}
            totalThisMonth={data.studentGrowth.totalThisMonth}
            growthPercent={data.studentGrowth.growthPercent}
          />
        </div>
      </section>

      <section aria-label="Hoạt động thời gian thực">
        <RecentActivityList activities={data.recentActivities} />
      </section>

      <section aria-label="Tiến trình Video AI">
        <PipelineStatusWidget items={data.pipelineVideos} />
      </section>
    </div>
  );
}
