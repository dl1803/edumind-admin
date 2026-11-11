"use client";

import { useState } from "react";
import { Check, FilmStrip } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatFileSize } from "@/lib/utils";
import { UploadProgress, UploadStatus } from "@/types/video.types";

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
          <div className="grid max-h-36 grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-200/60 overflow-y-auto">
            {progress.parts.map((part) => {
              const isCompleted = part.status === "COMPLETED";
              const isUploading = part.status === "UPLOADING";
              const isFailed = part.status === "FAILED";

              return (
                <div
                  key={part.partNumber}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] transition-all",
                    isCompleted && "bg-emerald-50/70 border-emerald-200 text-emerald-800",
                    isUploading && "bg-purple-50/70 border-purple-200 text-purple-800 font-medium",
                    isFailed && "bg-red-50/70 border-red-200 text-red-800 font-medium",
                    part.status === "PENDING" && "bg-neutral-100/60 border-neutral-200 text-neutral-400"
                  )}
                >
                  <span className="font-medium text-neutral-700">Phần {part.partNumber}</span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <Check size={12} weight="bold" />
                      <span>Xong</span>
                    </span>
                  )}
                  {isUploading && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-purple-700">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-600" />
                      </span>
                      <span>Đang tải</span>
                    </span>
                  )}
                  {isFailed && <span className="font-semibold text-red-600">Lỗi</span>}
                  {part.status === "PENDING" && <span className="text-neutral-300 text-[10px]">—</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {status === "FAILED" && errorMessage && (
        <p role="alert" className="text-[11px] font-medium text-error-600">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="px-3.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-100 transition text-xs cursor-pointer"
        >
          Hủy upload
        </button>
        {status === "UPLOADING" && (
          <button
            type="button"
            onClick={onPause}
            className="px-3.5 py-1.5 rounded-lg border border-purple-600 text-purple-700 font-medium hover:bg-purple-50 transition text-xs cursor-pointer"
          >
            Tạm dừng
          </button>
        )}
        {status === "PAUSED" && (
          <button
            type="button"
            onClick={onResume}
            className="px-4 py-1.5 rounded-lg text-white grad-nebula font-semibold shadow-nebula hover:opacity-95 transition text-xs cursor-pointer"
          >
            Tiếp tục
          </button>
        )}
        {status === "FAILED" && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-1.5 rounded-lg text-white grad-nebula font-semibold shadow-nebula hover:opacity-95 transition text-xs cursor-pointer"
          >
            Thử lại
          </button>
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
