'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { RevenuePoint } from '@/types/dashboard.types';
import { formatCurrency } from '@/lib/utils';

interface RevenueLineChartProps {
  data: RevenuePoint[];
  averagePerDay: number;
  completionRate: string;
}

export function RevenueLineChart({
  data,
  averagePerDay,
  completionRate,
}: RevenueLineChartProps) {
  const [filterRange, setFilterRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Custom Tooltip Recharts hiển thị tiếng Việt và định dạng VND
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#4C1D95] text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-mono font-bold">
          <p className="text-[10px] text-purple-200 font-sans">Ngày {label}</p>
          <p className="mt-0.5">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper
      title="Doanh thu 30 ngày qua"
      subtitle="Dữ liệu ghi nhận từ cổng thanh toán trực tuyến PayOS"
      actions={
        <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200/80 text-[11px] font-semibold">
          <button
            onClick={() => setFilterRange('7d')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterRange === '7d'
                ? 'grad-nebula text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            7 ngày
          </button>
          <button
            onClick={() => setFilterRange('30d')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterRange === '30d'
                ? 'grad-nebula text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            30 ngày
          </button>
          <button
            onClick={() => setFilterRange('90d')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterRange === '90d'
                ? 'grad-nebula text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            3 tháng
          </button>
        </div>
      }
      footer={
        <>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-[#7C3AED] rounded-xs" />
            <span>
              Doanh thu trung bình/ngày:{' '}
              <strong className="text-neutral-900 font-mono">
                {formatCurrency(averagePerDay)}
              </strong>
            </span>
          </div>
          <span className="text-emerald-700 font-semibold">{completionRate}</span>
        </>
      }
    >
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8B5CF6" stopOpacity={0.25} />
                <stop offset="100%" stop-color="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F3FF" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
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
              tickFormatter={(val) => `${val / 1_000_000}tr`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7C3AED"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#chartRevenueGrad)"
              activeDot={{ r: 5, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}
