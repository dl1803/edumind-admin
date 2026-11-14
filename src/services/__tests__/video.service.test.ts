import { mapPipelineResponse, mapVideoListItem, isVideoMockEnabled } from "../video.service";
import type { BackendPipelineStatus } from "@/types/video.types";

describe("videoService mappers & flags", () => {
  const originalMockFlag = process.env.NEXT_PUBLIC_USE_MOCK;

  afterEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalMockFlag;
  });

  it("nhận diện đúng cờ mock qua biến môi trường", () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    expect(isVideoMockEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_USE_MOCK = "false";
    expect(isVideoMockEnabled()).toBe(false);

    delete process.env.NEXT_PUBLIC_USE_MOCK;
    expect(isVideoMockEnabled()).toBe(false);
  });

  it("ném lỗi an toàn khi dữ liệu pipeline trả về null hoặc không hợp lệ", () => {
    expect(() => mapPipelineResponse(null)).toThrow("Phản hồi trạng thái pipeline không hợp lệ hoặc rỗng.");
    expect(() => mapPipelineResponse(undefined)).toThrow("Phản hồi trạng thái pipeline không hợp lệ hoặc rỗng.");
  });

  it("chuẩn hóa alias stt thành transcribe và lọc bỏ bước không hợp lệ", () => {
    const raw: BackendPipelineStatus = {
      video_id: "vid-test-01",
      lesson_id: "les-01",
      lesson_title: "Bài học 1",
      overall_status: "processing",
      steps: [
        { step: "upload", status: "completed", progress: 100 },
        { step: "stt", status: "processing", progress: 50 },
        { step: "unknown_step", status: "pending" },
      ],
    };

    const mapped = mapPipelineResponse(raw);
    expect(mapped.videoId).toBe("vid-test-01");
    expect(mapped.steps).toHaveLength(2);
    expect(mapped.steps[1].step).toBe("transcribe");
    expect(mapped.steps[1].status).toBe("processing");
  });

  it("suy luận overallStatus hợp lệ nếu backend trả về trạng thái lạ", () => {
    const raw: BackendPipelineStatus = {
      video_id: "vid-test-02",
      overall_status: "custom_status",
      steps: [
        { step: "upload", status: "completed" },
        { step: "transcode", status: "failed", error_message: "FFmpeg error" },
      ],
    };

    const mapped = mapPipelineResponse(raw);
    expect(mapped.overallStatus).toBe("failed");
  });

  it("mapVideoListItem ánh xạ đúng và gán null cho các trường thiếu của hợp đồng 08", () => {
    const raw: BackendPipelineStatus = {
      video_id: "vid-test-03",
      lesson_id: "les-03",
      lesson_title: "Bài học 3",
      overall_status: "completed",
      started_at: "2026-11-13T10:00:00Z",
    };

    const item = mapVideoListItem(raw);
    expect(item.videoId).toBe("vid-test-03");
    expect(item.lessonTitle).toBe("Bài học 3");
    expect(item.thumbnailUrl).toBeNull();
    expect(item.durationSec).toBeNull();
    expect(item.uploadedAt).toBe("2026-11-13T10:00:00Z");
  });
});
