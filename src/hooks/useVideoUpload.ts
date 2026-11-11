"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "@/hooks/useToast";
import { videoService } from "@/services/video.service";
import { ChunkUploadManager } from "@/lib/ChunkUploadManager";
import { FILE_TOO_LARGE_MESSAGE, INVALID_FORMAT_MESSAGE, resolveContentType } from "@/lib/uploadConstraints";
import {
  appendPendingPart,
  clearPendingUpload,
  loadPendingUpload,
  savePendingUpload,
} from "@/lib/uploadResumeStorage";
import { InitUploadResponse, UploadProgress, UploadStatus } from "@/types/video.types";

type UploadErrorKind = "FILE" | "CONFLICT" | "GENERAL";

interface UploadState {
  status: UploadStatus;
  progress: UploadProgress | null;
  videoId: string | null;
  isStarting: boolean;
  errorKind: UploadErrorKind | null;
  errorMessage: string | null;
}

type UploadAction =
  | { type: "STARTING" }
  | { type: "STATUS"; status: UploadStatus }
  | { type: "PROGRESS"; progress: UploadProgress }
  | { type: "FAILED"; kind: UploadErrorKind; message: string }
  | { type: "COMPLETED"; videoId: string }
  | { type: "RESET" };

const initialState: UploadState = {
  status: "IDLE",
  progress: null,
  videoId: null,
  isStarting: false,
  errorKind: null,
  errorMessage: null,
};

function reducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "STARTING":
      return { ...initialState, isStarting: true };
    case "STATUS":
      return { ...state, status: action.status, isStarting: false };
    case "PROGRESS":
      return { ...state, progress: action.progress };
    case "FAILED":
      return { ...state, isStarting: false, errorKind: action.kind, errorMessage: action.message };
    case "COMPLETED":
      return { ...state, status: "COMPLETED", videoId: action.videoId, isStarting: false, errorKind: null, errorMessage: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function readBackendError(error: unknown): { code?: string; message?: string } {
  const response = (
    error as { response?: { data?: { error?: { code?: string; message?: string } } } }
  )?.response;
  return {
    code: response?.data?.error?.code,
    message: response?.data?.error?.message ?? (error instanceof Error ? error.message : undefined),
  };
}

export function useVideoUpload() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const managerRef = useRef<ChunkUploadManager | null>(null);
  const statusRef = useRef<UploadStatus>("IDLE");
  const startingRef = useRef(false);
  const pausedByOfflineRef = useRef(false);

  statusRef.current = state.status;

  const handleRunError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : "Tải lên thất bại";
    dispatch({ type: "FAILED", kind: "GENERAL", message });
    toast.error(message);
  }, []);

  const start = useCallback(
    async (file: File, courseId: string, lessonId: string) => {
      const activeStatus = statusRef.current;
      if (startingRef.current || activeStatus === "UPLOADING" || activeStatus === "PAUSED") return;

      startingRef.current = true;
      dispatch({ type: "STARTING" });

      const stored = loadPendingUpload();
      const isResumingMatching =
        stored !== null &&
        stored.fileName === file.name &&
        stored.fileSize === file.size &&
        stored.lessonId === lessonId &&
        Boolean(stored.videoId) &&
        Boolean(stored.uploadId);

      let videoId = "";
      let uploadId = "";
      let partSize = 52428800;
      let totalParts = 1;
      let partsUploaded: number[] = [];
      let knownParts = stored && stored.uploadId ? stored.parts : [];

      if (isResumingMatching && stored) {
        videoId = stored.videoId;
        uploadId = stored.uploadId;
        partSize = stored.partSize ?? 52428800;
        totalParts = stored.totalParts ?? Math.ceil(file.size / partSize);
        partsUploaded = stored.parts.map((p) => p.partNumber);
        knownParts = stored.parts;
      } else {
        let init: InitUploadResponse;
        try {
          init = await videoService.initUpload({
            lessonId,
            fileName: file.name,
            fileSize: file.size,
            contentType: resolveContentType(file),
          });
        } catch (error) {
          startingRef.current = false;
          const { code, message } = readBackendError(error);
          if (code === "INVALID_FILE_FORMAT") {
            dispatch({ type: "FAILED", kind: "FILE", message: INVALID_FORMAT_MESSAGE });
          } else if (code === "FILE_TOO_LARGE") {
            dispatch({ type: "FAILED", kind: "FILE", message: FILE_TOO_LARGE_MESSAGE });
          } else if (code === "UPLOAD_IN_PROGRESS") {
            dispatch({
              type: "FAILED",
              kind: "CONFLICT",
              message: "Video của bài giảng này đang trong tiến trình xử lý. Vui lòng chờ xử lý xong trước khi tải video mới.",
            });
          } else if (code === "LESSON_NOT_FOUND") {
            dispatch({ type: "FAILED", kind: "GENERAL", message: "Bài giảng không tồn tại hoặc đã bị xóa" });
            toast.error("Bài giảng không tồn tại hoặc đã bị xóa");
          } else {
            const fallback = message ?? "Không thể khởi tạo tải lên";
            dispatch({ type: "FAILED", kind: "GENERAL", message: fallback });
            toast.error(fallback);
          }
          return;
        }

        videoId = init.videoId;
        uploadId = init.uploadId;
        partSize = init.partSize;
        totalParts = init.totalParts;
        partsUploaded = init.partsUploaded ?? [];
        knownParts = stored && stored.uploadId === init.uploadId ? stored.parts : [];

        savePendingUpload({
          videoId,
          uploadId,
          courseId,
          lessonId,
          fileName: file.name,
          fileSize: file.size,
          partSize,
          totalParts,
          parts: knownParts,
        });
      }

      let manager: ChunkUploadManager;
      try {
        manager = new ChunkUploadManager({
          file,
          videoId,
          uploadId,
          partSize,
          totalParts,
          partsUploaded,
          knownParts,
          onProgress: (progress) => dispatch({ type: "PROGRESS", progress }),
          onStatusChange: (status) => {
            if (status === "COMPLETED") {
              clearPendingUpload();
              dispatch({ type: "COMPLETED", videoId });
              toast.success("Tải lên hoàn tất. Hệ thống đang xử lý video.");
              return;
            }
            dispatch({ type: "STATUS", status });
          },
          onPartCompleted: appendPendingPart,
        });
      } catch (error) {
        startingRef.current = false;
        handleRunError(error);
        return;
      }

      managerRef.current = manager;
      startingRef.current = false;
      manager.start().catch(handleRunError);
    },
    [handleRunError]
  );

  const pause = useCallback(() => {
    managerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    pausedByOfflineRef.current = false;
    managerRef.current?.resume().catch(handleRunError);
  }, [handleRunError]);

  const cancel = useCallback(async () => {
    const manager = managerRef.current;
    try {
      if (manager) {
        await manager.cancel();
      } else {
        const pending = loadPendingUpload();
        if (pending) await videoService.cancelUpload(pending.videoId);
      }
      toast.info("Đã hủy upload");
    } catch {
      toast.error("Không thể hủy upload trên máy chủ");
    }
    managerRef.current = null;
    clearPendingUpload();
    dispatch({ type: "RESET" });
  }, []);

  const reset = useCallback(() => {
    managerRef.current = null;
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    if (state.status !== "UPLOADING") return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.status]);

  useEffect(() => {
    const handleOffline = () => {
      if (statusRef.current !== "UPLOADING") return;
      pausedByOfflineRef.current = true;
      managerRef.current?.pause();
      toast.warning("Mất kết nối mạng. Upload đã tạm dừng.");
    };
    const handleOnline = () => {
      if (pausedByOfflineRef.current && statusRef.current === "PAUSED") {
        toast.info("Đã có mạng trở lại. Nhấn Tiếp tục để upload tiếp.");
      }
      pausedByOfflineRef.current = false;
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    return () => {
      managerRef.current?.pause();
    };
  }, []);

  return {
    status: state.status,
    progress: state.progress,
    videoId: state.videoId,
    isStarting: state.isStarting,
    errorKind: state.errorKind,
    errorMessage: state.errorMessage,
    start,
    pause,
    resume,
    cancel,
    reset,
  };
}

