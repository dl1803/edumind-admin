import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (type: ToastType, message: string) => string;
  dismiss: (id: string) => void;
}

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => {
      const updated = [...state.toasts, { id, type, message }];
      if (updated.length > 5) {
        const removed = updated.shift();
        if (removed && toastTimers.has(removed.id)) {
          clearTimeout(toastTimers.get(removed.id));
          toastTimers.delete(removed.id);
        }
      }
      return { toasts: updated };
    });

    const timer = setTimeout(() => {
      useToastStore.getState().dismiss(id);
    }, 5000);
    toastTimers.set(id, timer);

    return id;
  },
  dismiss: (id) => {
    if (toastTimers.has(id)) {
      clearTimeout(toastTimers.get(id));
      toastTimers.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
  warning: (message: string) => useToastStore.getState().push("warning", message),
  info: (message: string) => useToastStore.getState().push("info", message),
};
