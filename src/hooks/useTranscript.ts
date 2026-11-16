import { useQuery } from "@tanstack/react-query";
import { transcriptService } from "@/services/transcript.service";

function normalizeVideoId(videoId: string | null): string | null {
  return videoId?.trim() || null;
}

export function useTranscript(videoId: string | null) {
  const normalizedId = normalizeVideoId(videoId);

  return useQuery({
    queryKey: ["transcript", normalizedId],
    queryFn: () => transcriptService.getTranscript(normalizedId as string),
    enabled: Boolean(normalizedId),
  });
}

export function useTranscriptVersion(videoId: string | null, version: number | null) {
  const normalizedId = normalizeVideoId(videoId);

  return useQuery({
    queryKey: ["transcript", normalizedId, version],
    queryFn: () => transcriptService.getTranscript(normalizedId as string, version as number),
    enabled: Boolean(normalizedId) && version !== null,
  });
}

export function useTranscriptVersions(videoId: string | null) {
  const normalizedId = normalizeVideoId(videoId);

  return useQuery({
    queryKey: ["transcript-versions", normalizedId],
    queryFn: () => transcriptService.getVersions(normalizedId as string),
    enabled: Boolean(normalizedId),
  });
}
