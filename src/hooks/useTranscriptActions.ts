import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import { transcriptService } from "@/services/transcript.service";
import type {
  SaveTranscriptResult,
  Transcript,
  TranscriptSegment,
} from "@/types/transcript.types";

export function useTranscriptActions(videoId: string | null) {
  const queryClient = useQueryClient();
  const normalizedId = videoId?.trim() || null;

  const applyResult = (result: SaveTranscriptResult) => {
    queryClient.setQueryData<Transcript | null>(["transcript", normalizedId], (current) =>
      current ? { ...current, version: result.version, segments: result.segments } : current
    );
    queryClient.invalidateQueries({ queryKey: ["transcript-versions", normalizedId] });
  };

  const save = useMutation({
    mutationFn: (segments: TranscriptSegment[]) =>
      transcriptService.saveTranscript(normalizedId as string, segments),
    onSuccess: (result) => {
      applyResult(result);
      toast.success(
        result.reindexingTriggered
          ? "Transcript đã cập nhật. Pipeline đang xử lý lại."
          : "Đã lưu."
      );
    },
    onError: () => toast.error("Không thể lưu phụ đề. Vui lòng thử lại sau."),
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
