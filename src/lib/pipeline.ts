import type {
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

