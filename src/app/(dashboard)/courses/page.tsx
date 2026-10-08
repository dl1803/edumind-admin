import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý khóa học</h1>
          <p className="text-sm text-neutral-500 mt-1">Danh sách tất cả các khóa học trong hệ sinh thái.</p>
        </div>
        <Link href="/courses/new">
          <Button variant="primary">Thêm khóa học mới</Button>
        </Link>
      </div>

      <Card>
        <p className="text-sm text-neutral-600 py-8 text-center">
          Dữ liệu bảng khóa học sẽ được xây dựng chi tiết ở các ngày tiếp theo.
        </p>
      </Card>
    </div>
  );
}
