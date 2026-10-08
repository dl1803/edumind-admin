"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function UIDemoPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">EduMind Admin — Shared UI Components Showcase</h1>

      {/* Button */}
      <Card title="1. Buttons">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Nebula</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button loading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      {/* Input */}
      <Card title="2. Inputs">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Họ và tên" placeholder="Nguyễn Văn A" />
          <Input label="Mật khẩu" type="password" placeholder="Nhập mật khẩu..." />
          <Input label="Lỗi validation" error="Email không đúng định dạng" />
          <TextArea label="Mô tả" placeholder="Nhập ghi chú..." />
        </div>
      </Card>

      {/* Modal & Toast */}
      <Card title="3. Modal & Toasts">
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setModalOpen(true)}>Mở Modal</Button>
          <Button variant="outlined" onClick={() => toast.success("Thành công!")}>
            Toast Success
          </Button>
          <Button variant="destructive" onClick={() => toast.error("Có lỗi xảy ra!")}>
            Toast Error
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Xác nhận thao tác"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button onClick={() => setModalOpen(false)}>Đồng ý</Button>
            </>
          }
        >
          <p>Nội dung modal demo kiểm tra phím Esc, click backdrop và scroll lock.</p>
        </Modal>
      </Card>

      {/* Badge (Zero-Pill) */}
      <Card title="4. Badges (Zero-Pill Rule)">
        <div className="flex gap-6">
          <Badge tone="success">Thành công</Badge>
          <Badge tone="warning">Cảnh báo</Badge>
          <Badge tone="error">Thất bại</Badge>
          <Badge tone="info">Đang xử lý</Badge>
          <Badge tone="neutral">Mặc định</Badge>
        </div>
      </Card>

      {/* Skeleton & Pagination */}
      <Card title="5. Skeleton & Pagination">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <SkeletonText lines={3} />
          <div className="pt-4 border-t">
            <Pagination page={currentPage} pageCount={20} onPageChange={setCurrentPage} />
          </div>
        </div>
      </Card>
    </div>
  );
}
