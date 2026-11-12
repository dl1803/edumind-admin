"use client";

import { Article, CloudArrowUp, FilmStrip, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  PIPELINE_STEP_LABELS,
  PIPELINE_STEP_ORDER,
  PIPELINE_STEP_STATUS_DISPLAY,
  formatClockTime,
  formatElapsedDuration,
} from "@/lib/pipeline";
import type {
  PipelineStep,
  PipelineStepName,
  PipelineStepStatus,
} from "@/types/video.types";

const STEP_ICONS: Record<PipelineStepName, typeof CloudArrowUp> = {
  upload: CloudArrowUp,
  transcode: FilmStrip,
  transcribe: Article,
  index: Sparkle,
};

const PROGRESS_BAR_FILL: Record<PipelineStepStatus, string> = {
  completed: "bg-emerald-500",
  processing: "grad-nebula",
  failed: "bg-rose-500",
  pending: "bg-neutral-200",
};

interface PipelineStepperProps {
  steps: PipelineStep[];
}

function resolveStepPercent(status: PipelineStepStatus, rawProgress: number | null | undefined): number {
  if (status === "completed") return 100;
  if (status === "pending") return 0;
  if (rawProgress === null || rawProgress === undefined || !Number.isFinite(rawProgress)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(rawProgress)));
}

function getStepTimeSummary(step: PipelineStep | undefined): string | null {
  if (!step) return null;
  const elapsed = formatElapsedDuration(step.startedAt, step.completedAt);
  if (elapsed) {
    return step.status === "failed" ? `Dừng sau ${elapsed}` : `Thời gian: ${elapsed}`;
  }
  if (step.startedAt) {
    return `Bắt đầu lúc ${formatClockTime(step.startedAt)}`;
  }
  return null;
}

export function PipelineStepper({ steps }: PipelineStepperProps) {
  return (
    <section
      aria-label="Tiến trình xử lý video"
      className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-purple-100">
        <h2 className="text-sm font-bold text-neutral-900">Tiến trình xử lý video</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Hệ thống xử lý tuần tự qua 4 giai đoạn trước khi sẵn sàng phục vụ.
        </p>
      </div>

      <ol
        aria-label="Các bước xử lý video"
        className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-100 bg-white"
      >
        {PIPELINE_STEP_ORDER.map((name, index) => {
          const current = steps.find((item) => item.step === name);
          const status = current?.status ?? "pending";
          const display = PIPELINE_STEP_STATUS_DISPLAY[status];
          const Icon = STEP_ICONS[name];
          const barPercent = resolveStepPercent(status, current?.progress);
          const timeSummary = getStepTimeSummary(current);

          return (
            <li
              key={name}
              className={cn(
                "p-5 flex flex-col justify-between gap-3",
                status === "processing" && "bg-amber-50/20",
                status === "failed" && "bg-rose-50/20"
              )}
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Icon size={18} weight="bold" className={display.textClassName} />
                  <p className="text-sm font-semibold text-neutral-900">
                    {index + 1}. {PIPELINE_STEP_LABELS[name]}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={cn("font-semibold", display.textClassName)}>
                      {display.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-semibold tabular-nums",
                        display.textClassName
                      )}
                    >
                      {barPercent}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`Tiến độ bước ${PIPELINE_STEP_LABELS[name]}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={barPercent}
                    className="w-full h-1.5 bg-neutral-100 rounded-sm overflow-hidden"
                  >
                    <div
                      className={cn("h-full transition-[width] duration-300", PROGRESS_BAR_FILL[status])}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {timeSummary ? (
                <p className="text-[11px] font-mono tabular-nums text-neutral-500 pt-2 border-t border-neutral-100">
                  {timeSummary}
                </p>
              ) : (
                <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
                  Chưa bắt đầu
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
