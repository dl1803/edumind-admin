import { useQuery } from "@tanstack/react-query";
import { mockGetTranscript } from "@/services/mock/transcript.mock";

export function useTranscript(videoId: string | null) {
  const normalizedId = videoId?.trim() || null;

  return useQuery({
    queryKey: ["transcript", normalizedId],
    queryFn: () => mockGetTranscript(normalizedId as string),
    enabled: Boolean(normalizedId),
  });
}
