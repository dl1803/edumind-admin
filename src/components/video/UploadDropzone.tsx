"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState } from "react";
import { FilmStrip, VideoCamera, WarningCircle, X } from "@phosphor-icons/react";
import { cn, formatFileSize } from "@/lib/utils";
import { VIDEO_ACCEPT_ATTRIBUTE } from "@/lib/uploadConstraints";

interface UploadDropzoneProps {
  file: File | null;
  error?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
}

export function UploadDropzone({ file, error, disabled = false, onFileSelect }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (selected) onFileSelect(selected);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={handleInputChange}
        tabIndex={-1}
      />
      {file ? (
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-2 truncate min-w-0">
              <FilmStrip size={16} weight="fill" className="text-purple-600 shrink-0" />
              <span className="font-bold text-neutral-900 truncate">{file.name}</span>
              <span className="text-neutral-500 font-sans tabular-nums shrink-0">{formatFileSize(file.size)}</span>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => onFileSelect(null)}
                aria-label="Bỏ file đã chọn"
                className="rounded p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition shrink-0 cursor-pointer"
                title="Bỏ file"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label="Chọn file video để tải lên"
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "p-6 border-2 border-dashed rounded-xl bg-purple-50/30 flex flex-col items-center justify-center text-center cursor-pointer transition",
            isDragging
              ? "scale-[1.01] border-purple-500 bg-purple-50/70"
              : "border-purple-300 hover:border-purple-500",
            error && "border-error-600 bg-rose-50/20",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-2 shrink-0">
            <VideoCamera size={24} weight="bold" />
          </div>
          <p className="text-xs font-bold text-neutral-900">
            Kéo và thả file video vào đây, hoặc <span className="text-purple-700 underline font-bold">duyệt từ máy tính</span>
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-sans">
            Định dạng hỗ trợ: MP4, MOV, AVI, MKV, WEBM (Dung lượng tối đa 5GB)
          </p>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-center gap-1.5 text-[11px] font-medium text-red-600">
          <WarningCircle size={14} weight="fill" className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
