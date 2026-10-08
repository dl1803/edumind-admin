import React from 'react';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-neutral-500 mt-1">Cấu hình tham số hệ thống và phân quyền.</p>
      </div>
      <Card>
        <p className="text-sm text-neutral-600 py-8 text-center">
          Trang đang trong giai đoạn xây dựng (Placeholder).
        </p>
      </Card>
    </div>
  );
}
