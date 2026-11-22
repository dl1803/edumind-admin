import type { VideoOverallStatus } from "@/types/video.types";

export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  edited: boolean;
}

export interface TranscriptVersion {
  version: number;
  createdAt: string;
  createdBy: string;
}

export interface Transcript {
  videoId: string;
  lessonId?: string;
  transcriptId?: string;
  videoTitle?: string;
  lessonTitle?: string;
  courseTitle?: string;
  version: number;
  previewUrl: string;
  segments: TranscriptSegment[];
  pipelineStatus?: VideoOverallStatus;
}

export interface SaveTranscriptResult {
  version: number;
  reindexingTriggered: boolean;
  segments: TranscriptSegment[];
}

export interface BackendTranscriptSegment {
  start?: number | null;
  end?: number | null;
  text?: string | null;
}

export interface BackendTranscriptResponse {
  transcript_id?: string | null;
  lesson_id?: string | null;
  version?: number | null;
  segments?: BackendTranscriptSegment[] | null;
  hls_stream_url?: string | null;
}

export interface BackendUpdateTranscriptResponse {
  message?: string;
  reindexing_triggered?: boolean;
}


