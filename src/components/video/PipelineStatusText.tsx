import { cn } from "@/lib/utils";
import type { VideoOverallStatus } from "@/types/video.types";

export const PIPELINE_STATUS_DISPLAY: Record<VideoOverallStatus, { label: string; textClassName: string }> = {
  uploading: { label: "Đang tải lên", textClassName: "text-amber-700" },
  uploaded: { label: "Chờ xử lý", textClassName: "text-slate-500" },
  processing: { label: "Đang xử lý", textClassName: "text-amber-700" },
  completed: { label: "Hoàn tất", textClassName: "text-emerald-700" },
  failed: { label: "Lỗi", textClassName: "text-rose-700" },
};

interface PipelineStatusTextProps {
  status: VideoOverallStatus;
  className?: string;
}

export function PipelineStatusText({ status, className }: PipelineStatusTextProps) {
  const display = PIPELINE_STATUS_DISPLAY[status] ?? {
    label: status || "Không xác định",
    textClassName: "text-slate-500",
  };

  return <span className={cn("text-xs font-medium whitespace-nowrap", display.textClassName, className)}>{display.label}</span>;
}

