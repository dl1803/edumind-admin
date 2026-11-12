import type {
  PipelineStep,
  PipelineStepName,
  PipelineStepStatus,
  VideoOverallStatus,
} from "@/types/video.types";

export const PIPELINE_POLL_INTERVAL_MS = 10_000;

export const PIPELINE_STEP_ORDER: PipelineStepName[] = ["upload", "transcode", "transcribe", "index"];

export const PIPELINE_STEP_LABELS: Record<PipelineStepName, string> = {
  upload: "Tải lên",
  transcode: "Xử lý video",
  transcribe: "Tạo phụ đề",
  index: "Đồng bộ AI",
};

export const PIPELINE_STEP_STATUS_DISPLAY: Record<
  PipelineStepStatus,
  { label: string; textClassName: string }
> = {
  pending: { label: "Chờ lượt", textClassName: "text-slate-500" },
  processing: { label: "Đang xử lý", textClassName: "text-amber-700" },
  completed: { label: "Hoàn tất", textClassName: "text-emerald-700" },
  failed: { label: "Lỗi", textClassName: "text-rose-700" },
};

export function isPipelineActive(status: VideoOverallStatus | undefined): boolean {
  return status === "uploading" || status === "uploaded" || status === "processing";
}

export function parsePipelineTimestamp(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const time = typeof value === "number" ? value : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function formatClockTime(value: string | number | null | undefined): string {
  const time = parsePipelineTimestamp(value);
  if (time === null) return "—";
  const date = new Date(time);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatElapsedDuration(
  startedAt: string | null | undefined,
  completedAt: string | null | undefined
): string | null {
  const start = parsePipelineTimestamp(startedAt);
  const end = parsePipelineTimestamp(completedAt);
  if (start === null || end === null || end < start) return null;
  const totalSeconds = Math.round((end - start) / 1000);
  if (totalSeconds < 60) return `${totalSeconds} giây`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes} phút ${seconds} giây` : `${minutes} phút`;
}

export function findFailedPipelineStep(
  steps: PipelineStep[]
): { step: PipelineStep; order: number; label: string } | null {
  for (let index = 0; index < PIPELINE_STEP_ORDER.length; index += 1) {
    const stepName = PIPELINE_STEP_ORDER[index];
    const matched = steps.find((item) => item.step === stepName && item.status === "failed");
    if (matched) {
      return {
        step: matched,
        order: index + 1,
        label: PIPELINE_STEP_LABELS[stepName],
      };
    }
  }
  return null;
}
