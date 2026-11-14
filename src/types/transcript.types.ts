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
}
