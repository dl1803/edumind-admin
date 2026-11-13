"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, WarningCircle } from "@phosphor-icons/react";
import { cn, formatDateTime } from "@/lib/utils";
import { findFailedPipelineStep } from "@/lib/pipeline";
import type { VideoPipeline } from "@/types/video.types";

const FALLBACK_ERROR_MESSAGE =
  "Hệ thống chưa thể hoàn tất bước xử lý này. Bạn có thể thử lại ở bước gặp sự cố.";

interface PipelineErrorDetailsProps {
  pipeline: VideoPipeline;
}

export function PipelineErrorDetails({ pipeline }: PipelineErrorDetailsProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const failed = findFailedPipelineStep(pipeline.steps);
  const stepLabel = failed ? `Bước ${failed.order}: ${failed.label}` : "Không xác định";
  const message = pipeline.errorMessage || failed?.step.errorMessage || FALLBACK_ERROR_MESSAGE;
  const occurredAt =
    failed?.step.completedAt || failed?.step.startedAt || pipeline.startedAt || undefined;
  const occurredAtText = formatDateTime(occurredAt);

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) return;
    const text = [
      `Mã video: ${pipeline.videoId}`,
      `Bài giảng: ${pipeline.lessonTitle || "—"}`,
      `Bước gặp sự cố: ${stepLabel}`,
      `Thông báo lỗi: ${message}`,
      `Thời điểm: ${occurredAtText}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50/70 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-rose-200">
        <div className="flex items-center gap-2 text-rose-700">
          <WarningCircle size={18} weight="fill" />
          <h2 className="text-sm font-semibold">Chi tiết lỗi</h2>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer",
            copied
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
          )}
        >
          {copied ? (
            <>
              <Check size={14} weight="bold" className="text-emerald-600" />
              <span>Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy size={14} weight="bold" />
              <span>Sao chép chi tiết lỗi</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs">
          <thead>
            <tr className="border-b border-rose-200/70 text-xs font-semibold text-rose-700">
              <th className="px-5 py-2.5 w-[25%] text-center whitespace-nowrap">Bước gặp sự cố</th>
              <th className="px-5 py-2.5 w-[50%] text-center whitespace-nowrap">Thông báo lỗi</th>
              <th className="px-5 py-2.5 w-[25%] text-center whitespace-nowrap">Thời điểm</th>
            </tr>
          </thead>
          <tbody className="text-xs leading-5">
            <tr className="text-neutral-800 align-top">
              <td className="px-5 py-3 text-center font-semibold text-neutral-900 whitespace-nowrap">{stepLabel}</td>
              <td className="px-5 py-3 text-center text-neutral-700 leading-relaxed">{message}</td>
              <td className="px-5 py-3 text-center font-mono tabular-nums text-neutral-600 whitespace-nowrap">{occurredAtText}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
