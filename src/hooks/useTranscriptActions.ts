import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import { transcriptService } from "@/services/transcript.service";
import { TranscriptConflictError } from "@/lib/transcript";
import type {
  SaveTranscriptResult,
  Transcript,
  TranscriptSegment,
} from "@/types/transcript.types";

interface SaveErrorLike {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      detail?: string;
      error?: { message?: string };
    };
  };
}

const SAVE_FORBIDDEN_MESSAGE = "Không có quyền";
const SAVE_VALIDATION_FALLBACK_MESSAGE =
  "Dữ liệu phụ đề không hợp lệ. Vui lòng kiểm tra lại các đoạn.";
const SAVE_GENERIC_MESSAGE = "Không thể lưu phụ đề. Vui lòng thử lại sau.";

export function resolveSaveErrorMessage(error: unknown): string {
  const apiError = error as SaveErrorLike | null;
  const status = apiError?.response?.status;
  if (status === 403) return SAVE_FORBIDDEN_MESSAGE;
  if (status === 400) {
    const message =
      apiError?.response?.data?.error?.message ||
      apiError?.response?.data?.message ||
      apiError?.response?.data?.detail;
    return typeof message === "string" && message.trim()
      ? message
      : SAVE_VALIDATION_FALLBACK_MESSAGE;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return apiError?.message || SAVE_GENERIC_MESSAGE;
}

export function useTranscriptActions(videoId: string | null) {
  const queryClient = useQueryClient();
  const normalizedId = videoId?.trim() || null;

  const applyResult = (result: SaveTranscriptResult) => {
    queryClient.setQueryData<Transcript | null>(["transcript", normalizedId], (current) =>
      current ? { ...current, version: result.version, segments: result.segments } : current
    );
    queryClient.invalidateQueries({ queryKey: ["transcript-versions", normalizedId] });
    queryClient.invalidateQueries({ queryKey: ["transcript", normalizedId] });
  };

  const save = useMutation({
    mutationFn: (segments: TranscriptSegment[]) => {
      const current = queryClient.getQueryData<Transcript | null>(["transcript", normalizedId]);
      return transcriptService.saveTranscript(
        normalizedId as string,
        segments,
        current?.version ?? 0,
        current?.transcriptId
      );
    },
    onSuccess: (result) => {
      applyResult(result);
      toast.success(
        result.reindexingTriggered
          ? "Đã lưu phụ đề. Hệ thống đang đồng bộ dữ liệu cho AI."
          : "Đã lưu thay đổi phụ đề."
      );
    },
    onError: (error) => {
      if (error instanceof TranscriptConflictError) return;
      toast.error(resolveSaveErrorMessage(error));
    },
  });

  const restore = useMutation({
    mutationFn: (version: number) =>
      transcriptService.restoreVersion(normalizedId as string, version),
    onSuccess: (result, version) => {
      applyResult(result);
      toast.success(`Đã khôi phục phiên bản ${version} thành phiên bản ${result.version}.`);
    },
    onError: () => toast.error("Không thể khôi phục phiên bản. Vui lòng thử lại sau."),
  });

  return { save, restore };
}
