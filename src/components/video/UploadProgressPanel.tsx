"use client";

import { useState } from "react";
import { FilmStrip } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatFileSize } from "@/lib/utils";
import { UploadPartStatus, UploadProgress, UploadStatus } from "@/types/video.types";

interface UploadProgressPanelProps {
  status: UploadStatus;
  progress: UploadProgress | null;
  fileName: string;
  errorMessage?: string | null;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onCancel: () => Promise<void>;
}

const STATUS_LABEL: Partial<Record<UploadStatus, string>> = {
  UPLOADING: "Đang tải",
  PAUSED: "Đã tạm dừng",
  FAILED: "Lỗi tải lên",
};

const STATUS_COLOR: Partial<Record<UploadStatus, string>> = {
  UPLOADING: "text-purple-700",
  PAUSED: "text-neutral-600",
  FAILED: "text-error-600",
};

const PART_LABEL: Record<UploadPartStatus, string> = {
  PENDING: "Chờ",
  UPLOADING: "Đang tải",
  COMPLETED: "Xong",
  FAILED: "Lỗi",
};

const PART_COLOR: Record<UploadPartStatus, string> = {
  PENDING: "text-neutral-500",
  UPLOADING: "text-purple-700",
  COMPLETED: "text-emerald-600",
  FAILED: "text-error-600",
};

export function UploadProgressPanel({
  status,
  progress,
  fileName,
  errorMessage,
  onPause,
  onResume,
  onRetry,
  onCancel,
}: UploadProgressPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const percent = progress?.totalPercent ?? 0;

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    await onCancel();
    setIsCancelling(false);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] gap-2">
          <div className="flex items-center gap-2 truncate min-w-0">
            <FilmStrip size={16} weight="fill" className="text-purple-600 shrink-0" />
            <span className="font-bold text-neutral-900 truncate">{fileName}</span>
            <span className="text-neutral-500 font-sans tabular-nums shrink-0">
              {formatFileSize(progress?.totalBytes ?? 0)}
            </span>
          </div>
          <span className={cn("font-bold font-sans tabular-nums shrink-0", STATUS_COLOR[status])}>
            {percent}% ({STATUS_LABEL[status]})
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Tiến độ tải lên"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full grad-nebula rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-neutral-500 pt-0.5">
          <span>Đã tải: {formatFileSize(progress?.uploadedBytes ?? 0)}</span>
          <span>Tổng: {formatFileSize(progress?.totalBytes ?? 0)}</span>
        </div>

        {progress && progress.parts.length > 0 && (
          <div className="grid max-h-32 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto text-[10px] pt-1.5 border-t border-neutral-200/60 sm:grid-cols-4">
            {progress.parts.map((part) => (
              <div key={part.partNumber} className="flex justify-between gap-2">
                <span className="text-neutral-600">Phần {part.partNumber}</span>
                <span className={cn("font-medium", PART_COLOR[part.status])}>{PART_LABEL[part.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {status === "FAILED" && errorMessage && (
        <p role="alert" className="text-[11px] font-medium text-error-600">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
          Hủy upload
        </Button>
        {status === "UPLOADING" && (
          <Button variant="outlined" size="sm" onClick={onPause}>
            Tạm dừng
          </Button>
        )}
        {status === "PAUSED" && (
          <Button size="sm" onClick={onResume}>
            Tiếp tục
          </Button>
        )}
        {status === "FAILED" && (
          <Button size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hủy upload?"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outlined" size="sm" onClick={() => setConfirmOpen(false)} disabled={isCancelling}>
              Tiếp tục tải
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmCancel} loading={isCancelling}>
              Hủy upload
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-700">
          Tiến độ đã tải sẽ bị hủy và video chưa được lưu. Bạn có chắc chắn muốn hủy?
        </p>
      </Modal>
    </div>
  );
}
