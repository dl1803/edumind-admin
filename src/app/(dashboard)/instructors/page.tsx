import React from 'react';
import { Card } from '@/components/ui/Card';

export default function InstructorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Quản lý giảng viên</h1>
        <p className="text-sm text-neutral-500 mt-1">Danh sách hồ sơ giảng viên và chuyên gia.</p>
      </div>
      <Card>
        <p className="text-sm text-neutral-600 py-8 text-center">
          Trang đang trong giai đoạn xây dựng (Placeholder).
        </p>
      </Card>
    </div>
  );
}
