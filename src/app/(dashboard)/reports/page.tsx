import React from 'react';
import { Card } from '@/components/ui/Card';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Báo cáo & Phân tích</h1>
        <p className="text-sm text-neutral-500 mt-1">Phân tích hành vi học tập và thống kê hệ thống AI.</p>
      </div>
      <Card>
        <p className="text-sm text-neutral-600 py-8 text-center">
          Trang đang trong giai đoạn xây dựng (Placeholder).
        </p>
      </Card>
    </div>
  );
}
