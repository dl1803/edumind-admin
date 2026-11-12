"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  PIPELINE_STEP_LABELS,
  PIPELINE_STEP_ORDER,
  formatClockTime,
  parsePipelineTimestamp,
} from "@/lib/pipeline";
import type { VideoPipeline } from "@/types/video.types";

interface TimelineEvent {
  key: string;
  timestamp: number | null;
  order: number;
  stage: string;
  message: string;
  tone: "neutral" | "success" | "error";
}

interface PipelineLogPanelProps {
  pipeline: VideoPipeline;
  updatedAt?: number;
}

function formatErrorEventMessage(rawMessage: string | null | undefined): string {
  const trimmed = rawMessage?.trim();
  if (!trimmed) return "Lỗi: Xử lý thất bại";
  return /^lỗi\s*:/i.test(trimmed) ? trimmed : `Lỗi: ${trimmed}`;
}

function buildTimelineEvents(pipeline: VideoPipeline): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  PIPELINE_STEP_ORDER.forEach((name, stepIndex) => {
    const step = pipeline.steps.find((item) => item.step === name);
    if (!step) return;

    const stage = PIPELINE_STEP_LABELS[name];
    const startedAt = parsePipelineTimestamp(step.startedAt);
    const completedAt = parsePipelineTimestamp(step.completedAt);

    if (startedAt !== null) {
      events.push({
        key: `${name}-start`,
        timestamp: startedAt,
        order: stepIndex * 10 + 1,
        stage,
        message: "Bắt đầu xử lý",
        tone: "neutral",
      });
    }

    if (step.status === "completed" && completedAt !== null) {
      events.push({
        key: `${name}-done`,
        timestamp: completedAt,
        order: stepIndex * 10 + 2,
        stage,
        message: "Hoàn tất",
        tone: "success",
      });
    }

    if (step.status === "failed") {
      events.push({
        key: `${name}-error`,
        timestamp: completedAt ?? startedAt,
        order: stepIndex * 10 + 3,
        stage,
        message: formatErrorEventMessage(step.errorMessage),
        tone: "error",
      });
    }
  });

  if (events.length === 0 && pipeline.errorMessage) {
    events.push({
      key: "pipeline-error",
      timestamp: parsePipelineTimestamp(pipeline.completedAt ?? pipeline.startedAt),
      order: 99,
      stage: "Hệ thống",
      message: formatErrorEventMessage(pipeline.errorMessage),
      tone: "error",
    });
  }

  return events.sort((a, b) => {
    if (a.timestamp === null && b.timestamp === null) return a.order - b.order;
    if (a.timestamp === null) return 1;
    if (b.timestamp === null) return -1;
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    return a.order - b.order;
  });
}

export function PipelineLogPanel({ pipeline, updatedAt = 0 }: PipelineLogPanelProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const events = buildTimelineEvents(pipeline);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopyDetails = async () => {
    if (events.length === 0 || !navigator.clipboard?.writeText) return;

    const header = pipeline.lessonTitle
      ? `Bài giảng: ${pipeline.lessonTitle}`
      : `Mã video: ${pipeline.videoId}`;
    const body = events
      .map((event) => {
        const clock = event.timestamp !== null ? formatClockTime(event.timestamp) : "--:--:--";
        return `[${clock}] ${event.stage} — ${event.message}`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(`${header}\n${body}`);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-label="Lịch sử các mốc xử lý"
      className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden"
    >
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-purple-100">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Lịch sử các mốc xử lý</h2>
          {updatedAt > 0 && (
            <p className="text-xs font-mono tabular-nums text-neutral-400 mt-0.5">
              Cập nhật lúc {formatClockTime(updatedAt)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyDetails}
          disabled={events.length === 0}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-neutral-200 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-xs font-semibold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-700">Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Sao chép chi tiết</span>
            </>
          )}
        </button>
      </div>

      {events.length === 0 ? (
        <p className="px-6 py-6 text-xs text-neutral-500 text-center">
          Chưa có mốc thời gian nào được ghi nhận.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-xs" aria-label="Bảng các mốc xử lý">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-6 w-[25%] text-center align-middle whitespace-nowrap">
                  Thời gian
                </th>
                <th className="py-3 px-6 w-[30%] text-center align-middle whitespace-nowrap">
                  Giai đoạn
                </th>
                <th className="py-3 px-6 w-[45%] text-center align-middle whitespace-nowrap">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs leading-5">
              {events.map((event) => (
                <tr key={event.key} className="hover:bg-purple-50/30 transition">
                  <td className="py-3.5 px-6 text-center align-middle font-mono text-neutral-500 tabular-nums whitespace-nowrap">
                    {event.timestamp !== null ? formatClockTime(event.timestamp) : "—"}
                  </td>
                  <td className="py-3.5 px-6 text-center align-middle font-semibold text-neutral-900 whitespace-nowrap">
                    {event.stage}
                  </td>
                  <td
                    className={cn(
                      "py-3.5 px-6 text-center align-middle break-words",
                      event.tone === "error"
                        ? "text-rose-700 font-medium"
                        : event.tone === "success"
                        ? "text-emerald-700 font-medium"
                        : "text-neutral-600"
                    )}
                  >
                    {event.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
