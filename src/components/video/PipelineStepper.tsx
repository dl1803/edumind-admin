import { Article, CloudArrowUp, FilmStrip, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  PIPELINE_STEP_LABELS,
  PIPELINE_STEP_ORDER,
  PIPELINE_STEP_STATUS_DISPLAY,
} from "@/lib/pipeline";
import type { PipelineStep, PipelineStepName } from "@/types/video.types";

const STEP_ICONS: Record<PipelineStepName, typeof CloudArrowUp> = {
  upload: CloudArrowUp,
  transcode: FilmStrip,
  transcribe: Article,
  index: Sparkle,
};

interface PipelineStepperProps {
  steps: PipelineStep[];
}

export function PipelineStepper({ steps }: PipelineStepperProps) {
  return (
    <ol
      aria-label="Các bước xử lý video"
      className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-100 bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden"
    >
      {PIPELINE_STEP_ORDER.map((name, index) => {
        const current = steps.find((item) => item.step === name);
        const status = current?.status ?? "pending";
        const display = PIPELINE_STEP_STATUS_DISPLAY[status];
        const Icon = STEP_ICONS[name];
        const hasProgress = current?.progress != null;
        const percent = Math.min(100, Math.max(0, Math.round(current?.progress ?? 0)));
        const showPercent = hasProgress && (status === "processing" || status === "failed");

        return (
          <li key={name} className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Icon size={20} weight="bold" className={display.textClassName} />
              <span className={cn("text-xs font-semibold tabular-nums", display.textClassName)}>
                {display.label}
                {showPercent ? ` ${percent}%` : ""}
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-900">
              {index + 1}. {PIPELINE_STEP_LABELS[name]}
            </p>
            {status === "processing" && hasProgress && (
              <div
                role="progressbar"
                aria-label={`Tiến độ bước ${PIPELINE_STEP_LABELS[name]}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden"
              >
                <div
                  className="h-full grad-nebula rounded-full transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
            {status === "failed" && current?.errorMessage && (
              <p className="text-xs text-rose-700 leading-5">{current.errorMessage}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

