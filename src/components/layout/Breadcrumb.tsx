'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Tổng quan',
  courses: 'Khóa học',
  videos: 'Video & Xử lý AI',
  questions: 'Ngân hàng câu hỏi',
  exercises: 'Bài tập & Kiểm tra',
  instructors: 'Giảng viên',
  students: 'Học viên',
  revenue: 'Doanh thu',
  reports: 'Báo cáo & Phân tích',
  settings: 'Cài đặt hệ thống',
  new: 'Tạo mới',
  edit: 'Chỉnh sửa',
  categories: 'Danh mục',
  upload: 'Upload video',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return <span className="text-sm font-bold text-neutral-900">EduMind Admin</span>;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      <Link
        href="/dashboard"
        className="text-neutral-500 hover:text-purple-700 font-medium transition"
      >
        Admin
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        // Nếu là UUID hoặc id số thì hiển thị 'Chi tiết', ngược lại tra từ điển
        const isId = /^[0-9a-fA-F-]+$/.test(segment);
        const label = isId ? 'Chi tiết' : (PATH_LABELS[segment] || segment);

        return (
          <React.Fragment key={href}>
            <CaretRight size={12} className="text-neutral-400" />
            {isLast ? (
              <span className="font-bold text-neutral-900">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-neutral-500 hover:text-purple-700 font-medium transition"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
