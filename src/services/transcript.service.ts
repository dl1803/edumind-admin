import axios from "axios";
import { apiClient } from "./api-client";
import { fetchPipelineStatus } from "./video.service";
import {
  mockGetTranscript,
  mockGetTranscriptVersions,
  mockRestoreTranscriptVersion,
  mockSaveTranscript,
} from "./mock/transcript.mock";
import { TranscriptConflictError } from "@/lib/transcript";
import type {
  BackendTranscriptResponse,
  BackendUpdateTranscriptResponse,
  SaveTranscriptResult,
  Transcript,
  TranscriptSegment,
  TranscriptVersion,
} from "@/types/transcript.types";

interface ValidRawSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptContext {
  videoId: string;
  lessonId: string;
  lessonTitle: string;
}

export function isTranscriptMockEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT !== undefined) {
    return process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT === "true";
  }
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

function unwrapResponse<T>(data: unknown, requiredKey: string): T {
  if (data && typeof data === "object" && !(requiredKey in data) && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

function buildSegmentId(index: number): string {
  return `seg-${String(index + 1).padStart(2, "0")}`;
}

function isValidRawSegment(item: unknown): item is ValidRawSegment {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.start === "number" &&
    Number.isFinite(candidate.start) &&
    candidate.start >= 0 &&
    typeof candidate.end === "number" &&
    Number.isFinite(candidate.end) &&
    candidate.end > candidate.start &&
    typeof candidate.text === "string" &&
    candidate.text.trim().length > 0
  );
}

export function mapTranscriptResponse(
  raw: BackendTranscriptResponse | null | undefined,
  context: TranscriptContext
): Transcript {
  if (!raw || typeof raw !== "object") {
    throw new Error("Phản hồi transcript không hợp lệ hoặc rỗng.");
  }
  const payload = unwrapResponse<BackendTranscriptResponse>(raw, "segments");
  const segments: TranscriptSegment[] = (Array.isArray(payload.segments) ? payload.segments : [])
    .filter(isValidRawSegment)
    .map((item, index) => ({
      id: buildSegmentId(index),
      startMs: Math.round(item.start * 1000),
      endMs: Math.round(item.end * 1000),
      text: item.text,
      edited: false,
    }));
  return {
    videoId: context.videoId,
    lessonId: payload.lesson_id ?? context.lessonId,
    transcriptId: payload.transcript_id ?? undefined,
    lessonTitle: context.lessonTitle || undefined,
    version: typeof payload.version === "number" ? payload.version : 0,
    previewUrl: payload.hls_stream_url ?? "",
    segments,
  };
}

function normalizeSegmentsForSave(segments: TranscriptSegment[]): TranscriptSegment[] {
  return segments.map((item, index) => ({
    ...item,
    id: buildSegmentId(index),
    text: item.text.trim(),
  }));
}

async function fetchRealTranscript(videoId: string): Promise<Transcript | null> {
  const pipeline = await fetchPipelineStatus(videoId);
  if (!pipeline) return null;
  if (!pipeline.lessonId) {
    throw new Error("Không xác định được bài giảng của video.");
  }
  const context: TranscriptContext = {
    videoId,
    lessonId: pipeline.lessonId,
    lessonTitle: pipeline.lessonTitle,
  };
  try {
    const response = await apiClient.get<BackendTranscriptResponse>(
      `/admin/lessons/${encodeURIComponent(pipeline.lessonId)}/transcript`
    );
    return mapTranscriptResponse(response.data, context);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return mapTranscriptResponse({ segments: [] }, context);
    }
    throw error;
  }
}

async function saveRealTranscript(
  segments: TranscriptSegment[],
  baseVersion: number,
  transcriptId: string | undefined
): Promise<SaveTranscriptResult> {
  if (!transcriptId) {
    throw new Error("Thiếu mã transcript để lưu thay đổi.");
  }
  const normalized = normalizeSegmentsForSave(segments);
  try {
    const response = await apiClient.put<BackendUpdateTranscriptResponse>(
      `/admin/transcripts/${encodeURIComponent(transcriptId)}`,
      {
        segments: normalized.map((item) => ({
          start: item.startMs / 1000,
          end: item.endMs / 1000,
          text: item.text,
        })),
      }
    );
    const resData = unwrapResponse<BackendUpdateTranscriptResponse>(
      response.data,
      "reindexing_triggered"
    );
    return {
      version: baseVersion,
      reindexingTriggered: Boolean(resData?.reindexing_triggered),
      segments: normalized,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new TranscriptConflictError();
    }
    throw error;
  }
}

export const transcriptService = {
  getTranscript: (videoId: string, version?: number): Promise<Transcript | null> => {
    if (isTranscriptMockEnabled()) return mockGetTranscript(videoId, version);
    if (version !== undefined) {
      return Promise.reject(
        new Error("Hợp đồng hiện tại chưa có API lấy transcript theo phiên bản.")
      );
    }
    return fetchRealTranscript(videoId);
  },
  getVersions: (videoId: string): Promise<TranscriptVersion[]> =>
    isTranscriptMockEnabled() ? mockGetTranscriptVersions(videoId) : Promise.resolve([]),
  saveTranscript: (
    videoId: string,
    segments: TranscriptSegment[],
    baseVersion: number,
    transcriptId?: string
  ): Promise<SaveTranscriptResult> =>
    isTranscriptMockEnabled()
      ? mockSaveTranscript(videoId, segments, baseVersion)
      : saveRealTranscript(segments, baseVersion, transcriptId),
  restoreVersion: (videoId: string, version: number): Promise<SaveTranscriptResult> =>
    isTranscriptMockEnabled()
      ? mockRestoreTranscriptVersion(videoId, version)
      : Promise.reject(
          new Error("Hợp đồng hiện tại chưa có API khôi phục phiên bản transcript.")
        ),
};
