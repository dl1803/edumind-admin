import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePipelineStatus } from "../usePipelineStatus";
import { PIPELINE_POLL_INTERVAL_MS } from "@/lib/pipeline";
import { videoService } from "@/services/video.service";
import type { VideoPipeline } from "@/types/video.types";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function makePipeline(overallStatus: VideoPipeline["overallStatus"], errorMessage: string | null = null): VideoPipeline {
  return {
    videoId: "vid-test",
    lessonId: "les-test",
    lessonTitle: "Bài kiểm thử Pipeline",
    steps: [
      { step: "upload", status: "completed", progress: 100, errorMessage: null, startedAt: null, completedAt: null },
      { step: "transcode", status: "processing", progress: 40, errorMessage: null, startedAt: null, completedAt: null },
      { step: "transcribe", status: "pending", progress: null, errorMessage: null, startedAt: null, completedAt: null },
      { step: "index", status: "pending", progress: null, errorMessage: null, startedAt: null, completedAt: null },
    ],
    overallStatus,
    errorMessage,
    startedAt: "2026-08-15T09:15:00+07:00",
    completedAt: overallStatus === "completed" ? "2026-08-15T09:16:00+07:00" : null,
  };
}

describe("usePipelineStatus", () => {
  const originalMockFlag = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalMockFlag;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("lấy trạng thái pipeline thành công cho video hoàn tất", async () => {
    const { result } = renderHook(() => usePipelineStatus("vid-01"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.overallStatus).toBe("completed");
    expect(result.current.data?.steps).toHaveLength(4);
  });

  it("trả về thông điệp lỗi hợp lệ cho kịch bản thất bại", async () => {
    const { result } = renderHook(() => usePipelineStatus("vid-03"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.overallStatus).toBe("failed");
    expect(result.current.data?.errorMessage).toBe(
      "Không nhận diện được giọng nói rõ ràng trong video"
    );
  });

  it("không gọi API khi videoId rỗng hoặc null", () => {
    const spy = jest.spyOn(videoService, "getPipelineStatus");

    const { result: nullResult } = renderHook(() => usePipelineStatus(null), {
      wrapper: createWrapper(),
    });
    const { result: blankResult } = renderHook(() => usePipelineStatus("   "), {
      wrapper: createWrapper(),
    });

    expect(nullResult.current.fetchStatus).toBe("idle");
    expect(blankResult.current.fetchStatus).toBe("idle");
    expect(spy).not.toHaveBeenCalled();
  });

  it("tự động polling mỗi 10 giây khi pipeline đang hoạt động", async () => {
    jest.useFakeTimers();
    const spy = jest
      .spyOn(videoService, "getPipelineStatus")
      .mockResolvedValue(makePipeline("processing"));

    const { result } = renderHook(() => usePipelineStatus("vid-test"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(PIPELINE_POLL_INTERVAL_MS);
    });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
  });

  it("dừng polling khi pipeline đã hoàn tất hoặc thất bại", async () => {
    jest.useFakeTimers();
    const spy = jest
      .spyOn(videoService, "getPipelineStatus")
      .mockResolvedValue(makePipeline("completed"));

    const { result } = renderHook(() => usePipelineStatus("vid-test"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(PIPELINE_POLL_INTERVAL_MS * 2);
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("chạy lại bước lỗi và chuyển trạng thái pipeline sang processing", async () => {
    const res = await videoService.retryPipelineStep("vid-17");

    expect(res.videoId).toBe("vid-17");
    expect(res.message).toContain("Tạo phụ đề");

    const updated = await videoService.getPipelineStatus("vid-17");
    expect(updated?.overallStatus).toBe("processing");
    expect(updated?.errorMessage).toBeNull();
    expect(updated?.steps.find((step) => step.step === "transcribe")?.status).toBe("processing");
  });
});

