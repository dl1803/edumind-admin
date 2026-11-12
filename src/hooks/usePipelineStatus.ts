import { useQuery } from "@tanstack/react-query";
import { videoService } from "@/services/video.service";
import { PIPELINE_POLL_INTERVAL_MS, isPipelineActive } from "@/lib/pipeline";

export function usePipelineStatus(videoId: string | null) {
  const normalizedId = videoId?.trim() || null;

  return useQuery({
    queryKey: ["pipeline", normalizedId],
    queryFn: () => videoService.getPipelineStatus(normalizedId as string),
    enabled: Boolean(normalizedId),
    staleTime: 0,
    refetchInterval: (query) =>
      isPipelineActive(query.state.data?.overallStatus) ? PIPELINE_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });
}
