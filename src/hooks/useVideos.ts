import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { videoService } from "@/services/video.service";
import type { VideoListParams } from "@/types/video.types";

export function useVideos(params: VideoListParams) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: () => videoService.getVideos(params),
    placeholderData: keepPreviousData,
  });
}

