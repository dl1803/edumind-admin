import { useQuery } from "@tanstack/react-query";
import { videoService } from "@/services/video.service";
import { PIPELINE_POLL_INTERVAL_MS, isPipelineActive } from "@/lib/pipeline";

export function usePipelineStatus(videoId: string | null) {
  return useQuery({
    queryKey: ["pipeline", videoId],
    queryFn: () => videoService.getPipelineStatus(videoId as string),
    enabled: Boolean(videoId),
    staleTime: 0,
    refetchInterval: (query) =>
      isPipelineActive(query.state.data?.overallStatus) ? PIPELINE_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });
}

