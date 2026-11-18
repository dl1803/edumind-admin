import {
  mockGetTranscript,
  mockGetTranscriptVersions,
  mockRestoreTranscriptVersion,
  mockSaveTranscript,
} from "./mock/transcript.mock";
import type { TranscriptSegment } from "@/types/transcript.types";

export const transcriptService = {
  getTranscript: (videoId: string, version?: number) => mockGetTranscript(videoId, version),
  getVersions: (videoId: string) => mockGetTranscriptVersions(videoId),
  saveTranscript: (videoId: string, segments: TranscriptSegment[]) =>
    mockSaveTranscript(videoId, segments),
  restoreVersion: (videoId: string, version: number) =>
    mockRestoreTranscriptVersion(videoId, version),
};
