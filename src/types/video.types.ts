export type UploadStatus = "IDLE" | "UPLOADING" | "PAUSED" | "COMPLETED" | "FAILED" | "CANCELLED";

export type UploadPartStatus = "PENDING" | "UPLOADING" | "COMPLETED" | "FAILED";

export interface InitUploadRequest {
  lessonId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface InitUploadResponse {
  videoId: string;
  uploadId: string;
  partSize: number;
  totalParts: number;
  partsUploaded: number[];
}

export interface PartUrlRequest {
  videoId: string;
  uploadId: string;
  partNumber: number;
}

export interface PartUrlResponse {
  presignedUrl: string;
  expiresAt: string;
}

export interface UploadedPart {
  partNumber: number;
  etag: string;
}

export interface CompleteUploadRequest {
  videoId: string;
  uploadId: string;
  parts: UploadedPart[];
}

export interface CompleteUploadResponse {
  videoId: string;
  overallStatus: string;
  message: string;
}

export interface CancelUploadResponse {
  message: string;
  overallStatus: string;
}

export interface PartProgress {
  partNumber: number;
  status: UploadPartStatus;
  loadedBytes: number;
  totalBytes: number;
}

export interface UploadProgress {
  totalPercent: number;
  uploadedBytes: number;
  totalBytes: number;
  parts: PartProgress[];
}

export interface BackendInitUploadResponse {
  video_id: string;
  upload_id: string;
  part_size: number;
  total_parts: number;
  parts_uploaded?: number[];
}

export interface BackendPartUrlResponse {
  presigned_url: string;
  expires_at: string;
}

export interface BackendCompleteUploadResponse {
  video_id: string;
  overall_status: string;
  message: string;
}

export interface BackendCancelUploadResponse {
  message: string;
  overall_status: string;
}

export interface PendingUpload {
  videoId: string;
  uploadId: string;
  courseId: string;
  lessonId: string;
  fileName: string;
  fileSize: number;
  partSize?: number;
  totalParts?: number;
  parts: UploadedPart[];
}

export type VideoOverallStatus = "uploading" | "uploaded" | "processing" | "completed" | "failed";

export type VideoListSort = "newest" | "oldest";

export interface VideoListItem {
  videoId: string;
  videoTitle?: string;
  lessonId: string;
  lessonTitle: string;
  courseTitle?: string;
  fileSizeMb?: number;
  overallStatus: VideoOverallStatus;
  thumbnailUrl: string | null;
  durationSec: number | null;
  uploadedAt: string;
}

export interface VideoListParams {
  search?: string;
  courseTitle?: string;
  status?: VideoOverallStatus;
  sort?: VideoListSort;
  page?: number;
  limit?: number;
}

export type PipelineStepName = "upload" | "transcode" | "transcribe" | "index";

export type PipelineStepStatus = "pending" | "processing" | "completed" | "failed";

export interface PipelineStep {
  step: PipelineStepName;
  status: PipelineStepStatus;
  progress: number | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface VideoPipeline {
  videoId: string;
  lessonId: string;
  lessonTitle: string;
  steps: PipelineStep[];
  overallStatus: VideoOverallStatus;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}


