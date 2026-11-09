import { STORAGE_KEYS } from "@/lib/constants";
import { PendingUpload, UploadedPart } from "@/types/video.types";

export function loadPendingUpload(): PendingUpload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PENDING_VIDEO_UPLOAD);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingUpload;
    if (!parsed.videoId || !parsed.uploadId || !Array.isArray(parsed.parts)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingUpload(pending: PendingUpload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PENDING_VIDEO_UPLOAD, JSON.stringify(pending));
  } catch {
    return;
  }
}

export function appendPendingPart(part: UploadedPart): void {
  const pending = loadPendingUpload();
  if (!pending) return;
  const parts = pending.parts.filter((item) => item.partNumber !== part.partNumber);
  savePendingUpload({ ...pending, parts: [...parts, part] });
}

export function clearPendingUpload(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PENDING_VIDEO_UPLOAD);
  } catch {
    return;
  }
}

