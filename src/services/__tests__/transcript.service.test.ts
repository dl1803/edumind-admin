import { TranscriptConflictError } from "@/lib/transcript";
import type { BackendTranscriptResponse } from "@/types/transcript.types";
import type { VideoPipeline } from "@/types/video.types";
import { apiClient } from "../api-client";
import { fetchPipelineStatus } from "../video.service";
import {
  isTranscriptMockEnabled,
  mapTranscriptResponse,
  transcriptService,
} from "../transcript.service";

jest.mock("../api-client", () => ({
  apiClient: { get: jest.fn(), put: jest.fn() },
}));
jest.mock("../video.service", () => ({
  fetchPipelineStatus: jest.fn(),
}));

const mockedGet = apiClient.get as jest.Mock;
const mockedPut = apiClient.put as jest.Mock;
const mockedFetchPipeline = fetchPipelineStatus as jest.Mock;

const ORIGINAL_MOCK = process.env.NEXT_PUBLIC_USE_MOCK;
const ORIGINAL_TRANSCRIPT_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT;

const PIPELINE: VideoPipeline = {
  videoId: "vid-x",
  lessonId: "les-1",
  lessonTitle: "Bài 1",
  steps: [],
  overallStatus: "completed",
  errorMessage: null,
  startedAt: null,
  completedAt: null,
};

const CONTEXT = { videoId: "vid-x", lessonId: "les-9", lessonTitle: "Bài 9" };

function createAxiosError(status: number) {
  return Object.assign(new Error(`HTTP ${status}`), {
    isAxiosError: true,
    response: { status },
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  process.env.NEXT_PUBLIC_USE_MOCK = ORIGINAL_MOCK;
  if (ORIGINAL_TRANSCRIPT_MOCK === undefined) {
    delete process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT;
  } else {
    process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT = ORIGINAL_TRANSCRIPT_MOCK;
  }
});

describe("chế độ mock", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT = "true";
  });

  it("nhận diện đúng cờ mock khi cờ transcript là true hoặc fallback về cờ chung", () => {
    process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT = "true";
    expect(isTranscriptMockEnabled()).toBe(true);

    delete process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT;
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    expect(isTranscriptMockEnabled()).toBe(true);
  });

  it("getTranscript trả về dữ liệu mẫu mà không gọi apiClient", async () => {
    const data = await transcriptService.getTranscript("vid-01");
    expect(data).not.toBeNull();
    expect(data?.segments.length).toBeGreaterThan(0);
    expect(mockedGet).not.toHaveBeenCalled();
  }, 10000);

  it("saveTranscript tăng số phiên bản sau khi lưu thành công", async () => {
    const current = await transcriptService.getTranscript("vid-06");
    expect(current).not.toBeNull();
    const result = await transcriptService.saveTranscript(
      "vid-06",
      current!.segments,
      current!.version
    );
    expect(result.version).toBe(current!.version + 1);
  }, 10000);

  it("saveTranscript ném lỗi TranscriptConflictError khi baseVersion cũ hơn", async () => {
    const current = await transcriptService.getTranscript("vid-05");
    expect(current).not.toBeNull();
    await expect(
      transcriptService.saveTranscript(
        "vid-05",
        current!.segments,
        current!.version - 1
      )
    ).rejects.toBeInstanceOf(TranscriptConflictError);
  }, 10000);

  it("getVersions trả về danh sách phiên bản có ít nhất 1 phần tử", async () => {
    const versions = await transcriptService.getVersions("vid-01");
    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThan(0);
  }, 10000);
});

describe("chế độ API thật", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT = "false";
  });

  it("isTranscriptMockEnabled trả về false khi cờ transcript là false", () => {
    process.env.NEXT_PUBLIC_USE_MOCK_TRANSCRIPT = "false";
    expect(isTranscriptMockEnabled()).toBe(false);
  });

  it("mapTranscriptResponse chuẩn hóa giây sang ms và lọc bỏ segment lỗi", () => {
    const raw = {
      transcript_id: "tc-01",
      lesson_id: "les-01",
      version: 2,
      hls_stream_url: "https://example.com/stream.m3u8",
      segments: [
        { start: 1.5, end: 4.25, text: "Hợp lệ" },
        { start: -1, end: 2, text: "Lỗi start âm" },
        { start: 5, end: 4, text: "Lỗi end nhỏ hơn start" },
        { start: 6, end: 7, text: "" },
        { start: 8, end: 9, text: "   " },
      ],
    };
    const mapped = mapTranscriptResponse(raw, CONTEXT);
    expect(mapped.videoId).toBe("vid-x");
    expect(mapped.lessonId).toBe("les-01");
    expect(mapped.transcriptId).toBe("tc-01");
    expect(mapped.version).toBe(2);
    expect(mapped.previewUrl).toBe("https://example.com/stream.m3u8");
    expect(mapped.segments).toHaveLength(1);
    expect(mapped.segments[0]).toEqual({
      id: "seg-01",
      startMs: 1500,
      endMs: 4250,
      text: "Hợp lệ",
      edited: false,
    });

    const noVersionMapped = mapTranscriptResponse(
      { segments: [{ start: 0, end: 1, text: "ok" }] },
      CONTEXT
    );
    expect(noVersionMapped.version).toBe(0);
  });

  it("mapTranscriptResponse hỗ trợ dữ liệu bọc trong envelope data", () => {
    const raw = {
      data: {
        transcript_id: "tc-envelope",
        lesson_id: "les-envelope",
        version: 3,
        segments: [{ start: 2, end: 5, text: "Trong envelope" }],
      },
    };
    const mapped = mapTranscriptResponse(raw as unknown as BackendTranscriptResponse, CONTEXT);
    expect(mapped.transcriptId).toBe("tc-envelope");
    expect(mapped.segments).toHaveLength(1);
    expect(mapped.segments[0].startMs).toBe(2000);
    expect(mapped.segments[0].endMs).toBe(5000);
    expect(mapped.segments[0].text).toBe("Trong envelope");
  });

  it("mapTranscriptResponse ném lỗi khi dữ liệu null và trả segments rỗng khi dữ liệu rỗng", () => {
    expect(() => mapTranscriptResponse(null, CONTEXT)).toThrow(
      "Phản hồi transcript không hợp lệ hoặc rỗng."
    );
    expect(() => mapTranscriptResponse(undefined, CONTEXT)).toThrow(
      "Phản hồi transcript không hợp lệ hoặc rỗng."
    );
    const mappedEmpty = mapTranscriptResponse({}, CONTEXT);
    expect(mappedEmpty.segments).toEqual([]);
  });

  it("getTranscript trả về null khi pipeline null và rejects khi lessonId rỗng", async () => {
    mockedFetchPipeline.mockResolvedValueOnce(null);
    const resNull = await transcriptService.getTranscript("vid-none");
    expect(resNull).toBeNull();

    mockedFetchPipeline.mockResolvedValueOnce({ ...PIPELINE, lessonId: "" });
    await expect(transcriptService.getTranscript("vid-no-lesson")).rejects.toThrow(
      "Không xác định được bài giảng của video."
    );
  });

  it("getTranscript gọi đúng endpoint bài giảng và parse thành công", async () => {
    mockedFetchPipeline.mockResolvedValueOnce(PIPELINE);
    mockedGet.mockResolvedValueOnce({
      data: {
        transcript_id: "tc-100",
        lesson_id: "les-1",
        version: 1,
        segments: [{ start: 1, end: 3, text: "Nội dung bài giảng" }],
      },
    });

    const res = await transcriptService.getTranscript("vid-x");
    expect(mockedGet).toHaveBeenCalledWith("/admin/lessons/les-1/transcript");
    expect(res?.transcriptId).toBe("tc-100");
    expect(res?.lessonTitle).toBe("Bài 1");
    expect(res?.segments).toHaveLength(1);
    expect(res?.segments[0].text).toBe("Nội dung bài giảng");
    expect(res?.pipelineStatus).toBe("completed");
  });

  it("getTranscript trả về segments rỗng khi bị 404 và ném lỗi khi 500 hoặc truyền version", async () => {
    mockedFetchPipeline.mockResolvedValueOnce(PIPELINE);
    mockedGet.mockRejectedValueOnce(createAxiosError(404));

    const res404 = await transcriptService.getTranscript("vid-x");
    expect(res404?.segments).toEqual([]);

    mockedFetchPipeline.mockResolvedValueOnce(PIPELINE);
    mockedGet.mockRejectedValueOnce(createAxiosError(500));
    await expect(transcriptService.getTranscript("vid-x")).rejects.toThrow("HTTP 500");

    await expect(transcriptService.getTranscript("vid-x", 1)).rejects.toThrow(
      "Hợp đồng hiện tại chưa có API lấy transcript theo phiên bản."
    );
  });

  it("getTranscript giữ trạng thái pipeline đang xử lý khi chưa có transcript", async () => {
    mockedFetchPipeline.mockResolvedValueOnce({ ...PIPELINE, overallStatus: "processing" });
    mockedGet.mockRejectedValueOnce(createAxiosError(404));

    const res = await transcriptService.getTranscript("vid-x");
    expect(res?.segments).toEqual([]);
    expect(res?.pipelineStatus).toBe("processing");
  });

  it("saveTranscript gửi PUT tới endpoint transcript và chuyển đổi ms sang giây", async () => {
    mockedPut.mockResolvedValueOnce({
      data: { message: "Saved", reindexing_triggered: true },
    });

    const segments = [
      { id: "seg-01", startMs: 1500, endMs: 3200, text: "  Lời thoại  ", edited: false },
    ];
    const res = await transcriptService.saveTranscript("vid-x", segments, 2, "tc-123");

    expect(mockedPut).toHaveBeenCalledWith("/admin/transcripts/tc-123", {
      segments: [{ start: 1.5, end: 3.2, text: "Lời thoại" }],
    });
    expect(res.version).toBe(2);
    expect(res.reindexingTriggered).toBe(true);
    expect(res.segments[0].text).toBe("Lời thoại");

    mockedPut.mockResolvedValueOnce({
      data: {
        data: { message: "Saved", reindexing_triggered: false },
      },
    });
    const resEnvelope = await transcriptService.saveTranscript("vid-x", segments, 3, "tc-123");
    expect(resEnvelope.reindexingTriggered).toBe(false);
  });

  it("saveTranscript ném lỗi khi thiếu transcriptId, 409 hoặc 500", async () => {
    const segments = [
      { id: "seg-01", startMs: 0, endMs: 1000, text: "text", edited: false },
    ];
    await expect(
      transcriptService.saveTranscript("vid-x", segments, 1, undefined)
    ).rejects.toThrow("Thiếu mã transcript để lưu thay đổi.");

    mockedPut.mockRejectedValueOnce(createAxiosError(409));
    await expect(
      transcriptService.saveTranscript("vid-x", segments, 1, "tc-1")
    ).rejects.toBeInstanceOf(TranscriptConflictError);

    mockedPut.mockRejectedValueOnce(createAxiosError(500));
    await expect(
      transcriptService.saveTranscript("vid-x", segments, 1, "tc-1")
    ).rejects.toThrow("HTTP 500");
  });

  it("getVersions trả về mảng rỗng và restoreVersion ném lỗi chưa hỗ trợ", async () => {
    const versions = await transcriptService.getVersions("vid-x");
    expect(versions).toEqual([]);

    await expect(transcriptService.restoreVersion("vid-x", 1)).rejects.toThrow(
      "Hợp đồng hiện tại chưa có API khôi phục phiên bản transcript."
    );
  });
});
