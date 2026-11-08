import { apiClient } from "./api-client";
import {
  BackendCancelUploadResponse,
  BackendCompleteUploadResponse,
  BackendInitUploadResponse,
  BackendPartUrlResponse,
  CancelUploadResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
  InitUploadRequest,
  InitUploadResponse,
  PartUrlRequest,
  PartUrlResponse,
} from "@/types/video.types";

function unwrap<T>(body: unknown, requiredKey: string): T {
  if (body && typeof body === "object" && !(requiredKey in body) && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export const videoService = {
  async initUpload(request: InitUploadRequest): Promise<InitUploadResponse> {
    const response = await apiClient.post<unknown>("/admin/videos/upload/init", {
      lesson_id: request.lessonId,
      file_name: request.fileName,
      file_size: request.fileSize,
      content_type: request.contentType,
    });
    const raw = unwrap<BackendInitUploadResponse>(response.data, "upload_id");
    return {
      videoId: raw.video_id,
      uploadId: raw.upload_id,
      partSize: raw.part_size,
      totalParts: raw.total_parts,
      partsUploaded: raw.parts_uploaded ?? [],
    };
  },

  async getPartUrl(request: PartUrlRequest): Promise<PartUrlResponse> {
    const response = await apiClient.post<unknown>("/admin/videos/upload", {
      video_id: request.videoId,
      upload_id: request.uploadId,
      part_number: request.partNumber,
    });
    const raw = unwrap<BackendPartUrlResponse>(response.data, "presigned_url");
    return { presignedUrl: raw.presigned_url, expiresAt: raw.expires_at };
  },

  async completeUpload(request: CompleteUploadRequest): Promise<CompleteUploadResponse> {
    const response = await apiClient.post<unknown>("/admin/videos/upload/complete", {
      video_id: request.videoId,
      upload_id: request.uploadId,
      parts: request.parts.map((part) => ({ part_number: part.partNumber, etag: part.etag })),
    });
    const raw = unwrap<BackendCompleteUploadResponse>(response.data, "overall_status");
    return { videoId: raw.video_id, overallStatus: raw.overall_status, message: raw.message };
  },

  async cancelUpload(videoId: string): Promise<CancelUploadResponse> {
    const response = await apiClient.put<unknown>(`/admin/pipeline/${videoId}/cancel`);
    const raw = unwrap<BackendCancelUploadResponse>(response.data, "overall_status");
    return { message: raw.message, overallStatus: raw.overall_status };
  },
};
