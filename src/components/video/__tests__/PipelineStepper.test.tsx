import React from "react";
import { render, screen } from "@testing-library/react";
import { PipelineStepper } from "../PipelineStepper";
import type { PipelineStep } from "@/types/video.types";

describe("PipelineStepper", () => {
  const processingSteps: PipelineStep[] = [
    { step: "upload", status: "completed", progress: 100, errorMessage: null, startedAt: null, completedAt: null },
    { step: "transcode", status: "processing", progress: 30, errorMessage: null, startedAt: null, completedAt: null },
    { step: "transcribe", status: "pending", progress: null, errorMessage: null, startedAt: null, completedAt: null },
    { step: "index", status: "pending", progress: null, errorMessage: null, startedAt: null, completedAt: null },
  ];

  it("hiển thị đủ 4 bước với nhãn thân thiện cho quản trị viên và không lộ thuật ngữ kỹ thuật", () => {
    const { container } = render(<PipelineStepper steps={processingSteps} />);

    expect(screen.getByText("1. Tải lên")).toBeInTheDocument();
    expect(screen.getByText("2. Xử lý video")).toBeInTheDocument();
    expect(screen.getByText("3. Tạo phụ đề")).toBeInTheDocument();
    expect(screen.getByText("4. Đồng bộ AI")).toBeInTheDocument();

    const textContent = container.textContent ?? "";
    expect(textContent).not.toMatch(/Whisper|STT|pgvector|HLS|Amazon S3/i);
  });

  it("tuân thủ Zero-Pill chữ phẳng, tách riêng phần trăm lên trên bên phải thanh tiến trình ở cả 4 bước", () => {
    const { container } = render(<PipelineStepper steps={processingSteps} />);

    const titleEl = screen.getByText("2. Xử lý video");
    const statusEl = screen.getByText("Đang xử lý");
    const percentEl = screen.getByText("30%");
    const uploadBar = screen.getByRole("progressbar", { name: "Tiến độ bước Tải lên" });
    const progressBar = screen.getByRole("progressbar", { name: "Tiến độ bước Xử lý video" });
    const pendingBar = screen.getByRole("progressbar", { name: "Tiến độ bước Tạo phụ đề" });

    expect(screen.getByText("Hoàn tất")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(statusEl).toBeInTheDocument();
    expect(percentEl).toBeInTheDocument();
    expect(screen.getAllByText("Chờ lượt")).toHaveLength(2);
    expect(screen.getAllByText("0%")).toHaveLength(2);
    expect(screen.getAllByText("Chưa bắt đầu")).toHaveLength(4);
    expect(screen.getAllByRole("progressbar")).toHaveLength(4);
    expect(uploadBar).toHaveAttribute("aria-valuenow", "100");
    expect(progressBar).toHaveAttribute("aria-valuenow", "30");
    expect(pendingBar).toHaveAttribute("aria-valuenow", "0");

    expect(titleEl.compareDocumentPosition(statusEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(statusEl.compareDocumentPosition(percentEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(percentEl.compareDocumentPosition(progressBar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(container.querySelectorAll(".rounded-full").length).toBe(0);
    expect(container.querySelectorAll(".rounded-full.border").length).toBe(0);
  });

  it("không lặp lại thông báo lỗi hoặc tổng thời gian thừa trên card tiến trình", () => {
    const failedSteps: PipelineStep[] = [
      {
        step: "upload",
        status: "completed",
        progress: 100,
        errorMessage: null,
        startedAt: "2026-08-15T14:40:00Z",
        completedAt: "2026-08-15T14:40:14Z",
      },
      {
        step: "transcode",
        status: "completed",
        progress: 100,
        errorMessage: null,
        startedAt: "2026-08-15T14:40:14Z",
        completedAt: "2026-08-15T14:40:38Z",
      },
      {
        step: "transcribe",
        status: "failed",
        progress: 45,
        errorMessage: "Không nhận diện được giọng nói rõ ràng trong video",
        startedAt: "2026-08-15T14:40:38Z",
        completedAt: "2026-08-15T14:40:58Z",
      },
      {
        step: "index",
        status: "pending",
        progress: null,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
      },
    ];

    render(<PipelineStepper steps={failedSteps} />);

    expect(screen.getByText("Lỗi")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("Dừng sau 20 giây")).toBeInTheDocument();
    expect(screen.queryByText(/Dừng tại Bước/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tổng thời gian/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Không nhận diện được giọng nói rõ ràng trong video")
    ).not.toBeInTheDocument();
  });
});
