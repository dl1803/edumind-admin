import React from 'react';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Tổng quan hệ thống</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Chào mừng quay trở lại, Quản trị viên EduMind!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card title="Khóa học hoạt động">
          <p className="text-3xl font-black text-purple-700 mt-2">24</p>
        </Card>
        <Card title="Video đang xử lý AI">
          <p className="text-3xl font-black text-amber-600 mt-2">3</p>
        </Card>
        <Card title="Tổng số học viên">
          <p className="text-3xl font-black text-blue-600 mt-2">1,248</p>
        </Card>
        <Card title="Doanh thu tháng">
          <p className="text-3xl font-black text-emerald-600 mt-2">125.000.000đ</p>
        </Card>
      </div>
    </div>
  );
}
