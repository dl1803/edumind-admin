import React from "react";
import { CheckCircle, Clock, WarningCircle, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

export interface StatusConfig {
  label: string;
  tone: StatusTone;
  icon?: React.ReactNode;
}

export const STATUS_MAP: Record<string, StatusConfig> = {
  PUBLISHED: {
    label: "Đã xuất bản",
    tone: "success",
    icon: <CheckCircle size={14} weight="fill" className="text-emerald-700" />,
  },
  DRAFT: {
    label: "Bản nháp",
    tone: "warning",
    icon: <Clock size={14} weight="fill" className="text-amber-700" />,
  },
  ARCHIVED: {
    label: "Đã lưu trữ",
    tone: "neutral",
    icon: <Info size={14} weight="fill" className="text-neutral-500" />,
  },
  HIDDEN: {
    label: "Đã ẩn",
    tone: "danger",
    icon: <WarningCircle size={14} weight="fill" className="text-rose-700" />,
  },
  COMPLETED: {
    label: "Hoàn tất",
    tone: "success",
    icon: <CheckCircle size={14} weight="fill" className="text-emerald-700" />,
  },
  PROCESSING: {
    label: "Đang xử lý",
    tone: "warning",
    icon: <Clock size={14} weight="fill" className="text-amber-700" />,
  },
  FAILED: {
    label: "Lỗi",
    tone: "danger",
    icon: <WarningCircle size={14} weight="fill" className="text-rose-700" />,
  },
  READY: {
    label: "Sẵn sàng",
    tone: "success",
    icon: <CheckCircle size={14} weight="fill" className="text-emerald-700" />,
  },
  NOT_READY: {
    label: "Chưa sẵn sàng",
    tone: "danger",
    icon: <WarningCircle size={14} weight="fill" className="text-rose-700" />,
  },
};

const toneColorMap: Record<StatusTone, string> = {
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-rose-700",
  info: "text-blue-700",
  neutral: "text-neutral-700",
};

export interface StatusTextProps {
  status: string;
  labelOverride?: string;
  className?: string;
}

export function StatusText({ status, labelOverride, className }: StatusTextProps) {
  const config = STATUS_MAP[status.toUpperCase()] || {
    label: labelOverride || status,
    tone: "neutral" as StatusTone,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap",
        toneColorMap[config.tone],
        className
      )}
    >
      {config.icon}
      <span>{labelOverride || config.label}</span>
    </span>
  );
}
