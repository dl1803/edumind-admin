"use client";

import React from 'react';
import Link from 'next/link';
import { CloudArrowUp } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { TopBarContent } from '@/context/TopBarContext';

export default function VideosPage() {
  return (
    <div className="space-y-6">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Video &amp; Xử lý AI</span>
            <span className="text-neutral-300">/</span>
            <h1 className="text-sm font-bold text-neutral-900">Kho video bài học</h1>
          </div>
        }
        actions={
          <Link
            href="/videos/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white grad-nebula shadow-nebula hover:opacity-95 font-semibold text-xs transition cursor-pointer"
          >
            <CloudArrowUp size={16} weight="bold" />
            <span>Tải lên video mới</span>
          </Link>
        }
      />
      <Card>
        <p className="text-sm text-neutral-600 py-8 text-center">
          Kho video bài học &amp; Tiến trình pipeline AI. Nhấn &quot;Tải lên video mới&quot; trên thanh công cụ phía trên để tải lên video.
        </p>
      </Card>
    </div>
  );
}
