import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import { videoService } from "@/services/video.service";
import type { PipelineStepName } from "@/types/video.types";

type PipelineAction = "retry" | "cancel";

interface ApiErrorLike {
  message?: string;
  response?: {
    status?: number;
    data?: { error?: { message?: string } };
  };
}

const CONFLICT_MESSAGES: Record<PipelineAction, string> = {
  retry: "Video không còn ở trạng thái lỗi nên không thể thử lại.",
  cancel: "Video không còn đang xử lý nên không thể hủy.",
};

const FALLBACK_MESSAGES: Record<PipelineAction, string> = {
  retry: "Không thể thử lại. Vui lòng thử lại sau.",
  cancel: "Không thể hủy xử lý. Vui lòng thử lại sau.",
};

function resolveActionErrorMessage(error: unknown, action: PipelineAction): string {
  const apiError = error as ApiErrorLike | null;
  const status = apiError?.response?.status;
  if (status === 404) return "Video không tồn tại hoặc đã bị xóa.";
  if (status === 409) return CONFLICT_MESSAGES[action];
  return (
    apiError?.response?.data?.error?.message ||
    apiError?.message ||
    FALLBACK_MESSAGES[action]
  );
}

export function usePipelineActions(videoId: string | null) {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["pipeline", videoId] });
    queryClient.invalidateQueries({ queryKey: ["videos"] });
  };

  const retry = useMutation({
    mutationFn: (step: PipelineStepName | undefined) =>
      videoService.retryPipelineStep(videoId as string, step ?? "transcribe"),
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(resolveActionErrorMessage(error, "retry")),
    onSettled: refresh,
  });

  const cancel = useMutation({
    mutationFn: () => videoService.cancelPipeline(videoId as string),
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(resolveActionErrorMessage(error, "cancel")),
    onSettled: refresh,
  });

  return { retry, cancel };
}

