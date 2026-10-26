'use client';

import React from 'react';
import Link from 'next/link';
import { FilmStrip, ArrowClockwise } from '@phosphor-icons/react';
import { PipelineItem } from '@/types/dashboard.types';

interface PipelineStatusWidgetProps {
  items: PipelineItem[];
}

export function PipelineStatusWidget({ items }: PipelineStatusWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-xs p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Tiến trình Video AI</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tự động tạo phụ đề và đồng bộ dữ liệu cho Trợ giảng AI
          </p>
        </div>
        <Link
          href="/videos"
          className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition flex items-center gap-1.5 border border-purple-200/80 shadow-2xs"
        >
          <FilmStrip size={14} weight="bold" />
          <span>Xem toàn bộ tiến trình</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const isError = item.status === 'error';
          const isCompleted = item.status === 'completed';

          // Tách số bài học và tên bài để bỏ text rườm rà
          const lessonNumberMatch = item.lessonName.match(/^(\d+)\./);
          const lessonNumber = lessonNumberMatch ? `Bài ${lessonNumberMatch[1]}` : null;
          const cleanedTitle = item.lessonName.replace(/^\d+\.\s*/, '');

          // Khung viền và nền card
          const cardBorder = isError
            ? 'border-red-200/90 bg-red-50/20'
            : isCompleted
            ? 'border-emerald-200/90 bg-emerald-50/20'
            : 'border-purple-200/80 bg-purple-50/15';

          // Màu sắc của thanh và các node theo 3 trạng thái chuẩn:
          // 1. Success -> Xanh toàn bộ (emerald)
          // 2. Error -> Đỏ toàn bộ (red)
          // 3. Đang chạy -> Màu chủ đạo 3 màu Nebula (Xanh dương #3B82F6 -> Tím #8B5CF6 -> Hồng #EC4899)
          let node1Color = '';
          let bar1Color = '';
          let node2Color = '';
          let bar2Color = '';
          let node3Color = '';

          let label1Color = '';
          let label2Color = '';
          let label3Color = '';

          if (isCompleted) {
            // Xanh toàn bộ
            node1Color = 'bg-emerald-500';
            bar1Color = 'bg-emerald-500';
            node2Color = 'bg-emerald-500';
            bar2Color = 'bg-emerald-500';
            node3Color = 'bg-emerald-500';

            label1Color = 'text-emerald-700 font-medium';
            label2Color = 'text-emerald-700 font-medium';
            label3Color = 'text-emerald-700 font-bold';
          } else if (isError) {
            // Đỏ toàn bộ ở khu vực lỗi
            node1Color = 'bg-red-500';
            bar1Color = 'bg-red-500';
            node2Color = 'bg-red-500';
            bar2Color = 'bg-neutral-200';
            node3Color = 'bg-neutral-300';

            label1Color = 'text-neutral-500';
            label2Color = 'text-red-600 font-bold';
            label3Color = 'text-neutral-400';
          } else {
            // Đang chạy: Màu chủ đạo 3 màu Nebula
            if (item.stages.vector === 'running') {
              // Đã xong bước 2 (Tạo phụ đề), đang chạy bước 3 (Đồng bộ AI)
              node1Color = 'bg-[#3B82F6]'; // Xanh dương
              bar1Color = 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]';
              node2Color = 'bg-[#8B5CF6]'; // Tím
              bar2Color = 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]';
              node3Color = 'bg-[#EC4899] animate-pulse shadow-sm shadow-pink-500/50'; // Hồng

              label1Color = 'text-neutral-600';
              label2Color = 'text-purple-700 font-medium';
              label3Color = 'text-pink-600 font-bold';
            } else {
              // Đang chạy bước 2 (Tạo phụ đề)
              node1Color = 'bg-[#3B82F6]'; // Xanh dương
              bar1Color = 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]';
              node2Color = 'bg-[#8B5CF6] animate-pulse shadow-sm shadow-purple-500/50'; // Tím
              bar2Color = 'bg-neutral-200';
              node3Color = 'bg-neutral-300';

              label1Color = 'text-neutral-600';
              label2Color = 'text-purple-700 font-bold';
              label3Color = 'text-neutral-400';
            }
          }

          // Nhãn trạng thái chuẩn hóa, ngắn gọn, thân thiện cho Quản trị viên (Admin):
          // Node 1: Tải lên
          // Node 2: Tạo phụ đề (khi lỗi: "Lỗi phụ đề")
          // Node 3: Đồng bộ AI (khi xong: "Hoàn tất", đang chờ: "Chờ đồng bộ", lỗi bước trước: "Tạm dừng")
          let node1Text = 'Tải lên';
          let node2Text = 'Tạo phụ đề';
          let node3Text = 'Đồng bộ AI';

          if (isCompleted) {
            node1Text = 'Tải lên';
            node2Text = 'Tạo phụ đề';
            node3Text = 'Hoàn tất';
          } else if (isError) {
            node1Text = 'Tải lên';
            node2Text = item.stages.stt === 'error' ? 'Lỗi phụ đề' : 'Tạo phụ đề';
            node3Text = 'Tạm dừng';
          } else {
            if (item.stages.vector === 'running') {
              node1Text = 'Tải lên';
              node2Text = 'Tạo phụ đề';
              node3Text = 'Đồng bộ AI';
            } else {
              node1Text = 'Tải lên';
              node2Text = 'Tạo phụ đề';
              node3Text = 'Chờ đồng bộ';
            }
          }

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border ${cardBorder} flex flex-col justify-between gap-3.5 transition hover:shadow-xs`}
            >
              {/* Header của thẻ: CHỈ HIỂN THỊ TEXT TRẠNG THÁI & NÚT THỬ LẠI / % TIẾN ĐỘ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold ${
                      isError
                        ? 'text-red-600'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-purple-700'
                    }`}
                  >
                    {item.stageName}
                  </span>

                  {isError ? (
                    <Link
                      href="/videos"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <ArrowClockwise size={13} weight="bold" />
                      <span>Thử lại</span>
                    </Link>
                  ) : (
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isCompleted ? 'text-emerald-700' : 'text-neutral-600'
                      }`}
                    >
                      {item.progressPercent}%
                    </span>
                  )}
                </div>

                {/* Tên bài giảng nằm ngang với Card số bài học */}
                <div className="flex items-center gap-1.5">
                  {lessonNumber && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100/70 text-purple-800 shrink-0">
                      {lessonNumber}
                    </span>
                  )}
                  <p
                    className="text-xs font-bold text-neutral-900 truncate"
                    title={cleanedTitle}
                  >
                    {cleanedTitle}
                  </p>
                </div>

                {/* Tên file video */}
                <p className="text-[10px] text-neutral-400 font-mono mt-1 truncate" title={item.fileName}>
                  {item.fileName}
                </p>
              </div>

              {/* Thanh tiến độ dạng Node Stepper (*-*-*): 
                  - Đầu và cuối là 2 node, không có thanh ngang thừa
                  - Các node là hình tròn đục màu hoàn toàn
              */}
              <div className="pt-1">
                <div className="flex items-center">
                  {/* Node 1: Tải lên */}
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${node1Color}`} />

                  {/* Thanh nối 1 -> 2 */}
                  <div className={`flex-1 h-1 rounded-full mx-0.5 transition-all duration-300 ${bar1Color}`} />

                  {/* Node 2: Tạo phụ đề */}
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${node2Color}`} />

                  {/* Thanh nối 2 -> 3 */}
                  <div className={`flex-1 h-1 rounded-full mx-0.5 transition-all duration-300 ${bar2Color}`} />

                  {/* Node 3: Đồng bộ AI / Hoàn tất */}
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${node3Color}`} />
                </div>

                {/* Text trạng thái chuẩn nghiệp vụ ở dưới từng node (căn đều) */}
                <div className="flex items-center justify-between text-[10px] mt-1.5 select-none">
                  <span className={`text-left shrink-0 ${label1Color}`}>{node1Text}</span>
                  <span className={`text-center shrink-0 ${label2Color}`}>{node2Text}</span>
                  <span className={`text-right shrink-0 ${label3Color}`}>{node3Text}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
