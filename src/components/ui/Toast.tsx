"use client";

import * as React from "react";
import {
  CheckCircle,
  XCircle,
  Warning,
  Info,
  X,
} from "@phosphor-icons/react";
import { useToastStore, ToastItem, ToastType } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const toastIconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle weight="fill" size={20} className="text-success-600 shrink-0" />,
  error: <XCircle weight="fill" size={20} className="text-error-600 shrink-0" />,
  warning: <Warning weight="fill" size={20} className="text-warning-600 shrink-0" />,
  info: <Info weight="fill" size={20} className="text-info-600 shrink-0" />,
};

export function ToastItemView({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto bg-white rounded-xl shadow-md p-4 flex items-start gap-3 border border-neutral-100 animate-slide-in-right",
        "w-full transition-all"
      )}
    >
      <div className="pt-0.5">{toastIconMap[toast.type]}</div>
      <div className="flex-1 text-sm text-neutral-800 break-words">{toast.message}</div>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => dismiss(toast.id)}
        className="text-neutral-400 hover:text-neutral-700 transition-colors p-0.5 rounded-lg hover:bg-neutral-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
