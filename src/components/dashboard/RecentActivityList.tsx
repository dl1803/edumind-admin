'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { RecentActivityItem } from '@/types/dashboard.types';

interface RecentActivityListProps {
  activities: RecentActivityItem[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const getStatusColor = (color: RecentActivityItem['statusColor']) => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-700';
      case 'purple':
        return 'text-purple-700';
      case 'amber':
        return 'text-amber-700';
      case 'rose':
        return 'text-rose-700';
      case 'neutral':
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-purple-100/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-purple-100/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Hoạt động gần đây</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Nhật ký sự kiện thời gian thực từ học viên và hệ thống
          </p>
        </div>
        <Link
          href="/reports"
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
        >
          <span>Xem tất cả (28 hoạt động)</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-purple-50/50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-purple-100">
              <th className="py-3 px-5 w-40 min-w-[140px] whitespace-nowrap text-center">
                Thời gian
              </th>
              <th className="py-3 px-5 w-48 min-w-[180px] whitespace-nowrap text-center">
                Hành động
              </th>
              <th className="py-3 px-5 min-w-[360px] whitespace-nowrap text-center">
                Đối tượng
              </th>
              <th className="py-3 px-5 w-48 min-w-[170px] whitespace-nowrap text-center">
                Trạng thái
              </th>
              <th className="py-3 px-5 w-28 whitespace-nowrap text-center">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 text-xs text-neutral-800">
            {activities.map((item) => (
              <tr key={item.id} className="hover:bg-purple-50/40 transition">
                <td className="py-3.5 px-5 font-sans text-xs font-normal text-neutral-500 whitespace-nowrap text-center">
                  {item.timeAgo}
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap text-center">
                  <span className="font-semibold text-neutral-900">{item.actionTitle}</span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="font-medium text-neutral-900">{item.targetTitle}</span>
                    <span className="text-neutral-300">-</span>
                    <span className="text-neutral-500 text-[11px]">{item.targetSub}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-center whitespace-nowrap">
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${getStatusColor(
                      item.statusColor
                    )}`}
                  >
                    {item.statusText}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-center whitespace-nowrap">
                  <Link
                    href={item.detailLink || '#'}
                    className="text-purple-700 hover:underline font-medium text-[11px]"
                  >
                    {item.detailLabel}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
