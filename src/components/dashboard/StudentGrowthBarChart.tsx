'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { ArrowUpRight } from '@phosphor-icons/react';
import { StudentGrowthPoint } from '@/types/dashboard.types';

interface StudentGrowthBarChartProps {
  data: StudentGrowthPoint[];
  totalThisMonth: number;
  growthPercent: number;
}

export function StudentGrowthBarChart({
  data,
  totalThisMonth,
  growthPercent,
}: StudentGrowthBarChartProps) {
  const barColors = ['#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6'];

  return (
    <ChartWrapper
      title="Học viên mới theo tuần"
      subtitle="Số lượng đăng ký tài khoản trong tháng 09/2026"
      footer={
        <>
          <span>
            Tổng tháng này:{' '}
            <strong className="text-neutral-900 font-mono">{totalThisMonth} học viên</strong>
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight size={14} weight="bold" /> +{growthPercent}% so với tháng trước
          </span>
        </>
      }
    >
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F3FF" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              cursor={false}
              formatter={(val: any) => [`${val} học viên`, 'Đăng ký']}
              contentStyle={{
                backgroundColor: '#FAF5FF',
                borderColor: '#E9D5FF',
                borderRadius: '8px',
                fontSize: '11px',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}
