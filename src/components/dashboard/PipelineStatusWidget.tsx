'use client';

import React from 'react';
import Link from 'next/link';
import {
  FilmStrip,
  Spinner,
  CheckCircle,
  WarningCircle,
  Check,
  HourglassSimple,
  X,
} from '@phosphor-icons/react';
import { PipelineItem } from '@/types/dashboard.types';

interface PipelineStatusWidgetProps {
  items: PipelineItem[];
}

export function PipelineStatusWidget({ items }: PipelineStatusWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-purple-100/80 shadow-xs p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Trạng thái Pipeline Video AI</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tiến trình bóc băng âm thanh STT và lập chỉ mục Vector bài giảng tự động
          </p>
        </div>
        <Link
          href="/videos"
          className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition flex items-center gap-1.5 border border-purple-200"
        >
          <FilmStrip size={14} />
          <span>Xem toàn bộ Pipeline</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const isError = item.status === 'error';
          const isCompleted = item.status === 'completed';

          const cardTheme = isError
            ? 'border-red-200/80 bg-red-50/25'
            : isCompleted
            ? 'border-emerald-200/80 bg-emerald-50/25'
            : 'border-amber-200/80 bg-amber-50/25';

          const progressBg = isError
            ? 'bg-red-500'
            : isCompleted
            ? 'bg-emerald-500'
            : 'bg-amber-500';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${cardTheme} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-bold flex items-center gap-1 ${
                      isError
                        ? 'text-red-600'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {isError ? (
                      <>
                        <WarningCircle size={13} weight="bold" /> {item.stageName}
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle size={13} weight="bold" /> {item.stageName}
                      </>
                    ) : (
                      <>
                        <Spinner size={13} weight="bold" className="animate-spin" />{' '}
                        {item.stageName}
                      </>
                    )}
                  </span>
                  {isError ? (
                    <Link
                      href="/videos"
                      className="text-[10px] text-red-700 font-bold hover:underline"
                    >
                      Thử lại
                    </Link>
                  ) : (
                    <span
                      className={`text-[10px] font-mono ${
                        isCompleted
                          ? 'text-emerald-700 font-bold'
                          : 'text-neutral-500'
                      }`}
                    >
                      {item.progressPercent}%
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-neutral-900 truncate" title={item.lessonName}>
                  {item.lessonName}
                </p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                  {item.fileName}
                </p>
              </div>

              <div className="mt-3">
                <div className="w-full h-1.5 bg-neutral-200/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressBg} rounded-full transition-all duration-500`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-2">
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    <Check size={11} weight="bold" /> Tải lên
                  </span>
                  <span
                    className={`flex items-center gap-0.5 ${
                      item.stages.stt === 'done'
                        ? 'text-emerald-600 font-medium'
                        : item.stages.stt === 'error'
                        ? 'text-red-600 font-bold'
                        : item.stages.stt === 'running'
                        ? 'text-amber-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {item.stages.stt === 'done' && <Check size={11} weight="bold" />}
                    {item.stages.stt === 'error' && <X size={11} weight="bold" />}
                    {item.stages.stt === 'running' && <HourglassSimple size={11} weight="fill" />}
                    <span>
                      {item.stages.stt === 'done'
                        ? 'STT'
                        : item.stages.stt === 'error'
                        ? 'Lỗi STT'
                        : item.stages.stt === 'running'
                        ? 'STT'
                        : 'Chờ'}
                    </span>
                  </span>
                  <span
                    className={`flex items-center gap-0.5 ${
                      item.stages.vector === 'done'
                        ? 'text-emerald-600 font-medium'
                        : item.stages.vector === 'running'
                        ? 'text-amber-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {item.stages.vector === 'done' && <Check size={11} weight="bold" />}
                    {item.stages.vector === 'running' && <HourglassSimple size={11} weight="fill" />}
                    <span>
                      {item.stages.vector === 'done'
                        ? 'Hoàn tất'
                        : item.stages.vector === 'running'
                        ? 'Vector'
                        : 'Chờ'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
