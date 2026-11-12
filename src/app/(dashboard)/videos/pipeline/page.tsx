"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  WarningCircle,
} from "@phosphor-icons/react";
import { TopBarContent } from "@/context/TopBarContext";
import { usePipelineStatus } from "@/hooks/usePipelineStatus";
import {
  findFailedPipelineStep,
  formatElapsedDuration,
  isPipelineActive,
} from "@/lib/pipeline";
import { formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { PipelineStatusText } from "@/components/video/PipelineStatusText";
import { PipelineStepper } from "@/components/video/PipelineStepper";
import { PipelineLogPanel } from "@/components/video/PipelineLogPanel";

function PipelineContent() {
  const searchParams = useSearchParams();
  const rawVideoId = searchParams.get("videoId");
  const videoId = rawVideoId?.trim() || null;

  const { data, isError, isFetching, refetch, dataUpdatedAt } = usePipelineStatus(videoId);

  const topBar = (
    <TopBarContent
      breadcrumb={
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/videos"
            className="text-neutral-500 hover:text-purple-700 font-medium transition"
          >
            Video &amp; Xử lý AI
          </Link>
          <span className="text-neutral-300">/</span>
          <Link
            href="/videos"
            className="text-neutral-500 hover:text-purple-700 font-medium transition"
          >
            Kho video bài học
          </Link>
          <span className="text-neutral-300">/</span>
          <h1 className="text-sm font-bold text-neutral-900">Theo dõi xử lý video</h1>
        </div>
      }
      actions={
        <Link
          href="/videos"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-neutral-200 bg-white hover:bg-purple-50 text-xs font-semibold text-neutral-700 transition"
        >
          <ArrowLeft size={14} />
          <span>Về kho video bài học</span>
        </Link>
      }
    />
  );

  if (!videoId || (!isError && data === null)) {
    return (
      <div className="min-h-[calc(100vh-220px)] flex flex-col items-center justify-center p-6">
        {topBar}
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl border border-purple-100 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <WarningCircle size={28} weight="fill" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">
            Không tìm thấy thông tin video
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {videoId
              ? "Mã video không tồn tại hoặc đã bị xóa khỏi hệ thống."
              : "Vui lòng chọn một video từ kho bài học để theo dõi tiến trình xử lý."}
          </p>
          <div className="pt-1">
            <Link
              href="/videos"
              className="inline-flex items-center justify-center h-9 px-5 text-xs font-semibold text-white grad-nebula rounded-xl hover:opacity-95 transition shadow-nebula"
            >
              Về kho video bài học
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = isPipelineActive(data?.overallStatus);
  const isCompleted = data?.overallStatus === "completed";
  const isFailed = data?.overallStatus === "failed";
  const totalElapsed =
    isCompleted && data ? formatElapsedDuration(data.startedAt, data.completedAt) : null;
  const failedInfo = isFailed && data ? findFailedPipelineStep(data.steps) : null;
  const failureDetail =
    data?.errorMessage ||
    failedInfo?.step.errorMessage ||
    "Hệ thống chưa thể hoàn tất bước xử lý này. Bạn có thể thử lại ở bước gặp sự cố.";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {topBar}

      {isError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
            <span>Không thể tải tiến trình xử lý video. Vui lòng thử lại.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3.5 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <ArrowClockwise size={14} className={isFetching ? "animate-spin" : undefined} />
            <span>{isFetching ? "Đang thử lại..." : "Thử lại"}</span>
          </button>
        </div>
      )}

      {!data && !isError && (
        <div role="status" aria-busy="true" className="space-y-6">
          <div className="bg-white rounded-2xl border border-purple-100 shadow-xs p-6 space-y-3">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-3.5 w-80" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <span className="sr-only">Đang tải tiến trình xử lý video...</span>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <section
            aria-label="Thông tin tiến trình video"
            className="bg-white rounded-2xl border border-purple-100 shadow-xs p-6 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <h2 className="text-lg font-bold text-neutral-900 truncate">
                  {data.lessonTitle || "Video chưa gán bài giảng"}
                </h2>
                <p className="text-xs text-neutral-500">
                  Tự động tạo phụ đề và đồng bộ dữ liệu cho Trợ giảng AI
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isActive && (
                  <button
                    type="button"
                    title="Hủy tiến trình xử lý hiện tại"
                    className="inline-flex items-center justify-center h-9 px-3.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Hủy tiến trình
                  </button>
                )}

                {isFailed && (
                  <button
                    type="button"
                    title="Thử lại bước xử lý gặp sự cố"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    <ArrowClockwise size={14} weight="bold" />
                    <span>Thử lại</span>
                  </button>
                )}

                {isCompleted && (
                  <Link
                    href={`/videos/transcript?videoId=${encodeURIComponent(data.videoId)}`}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold text-white grad-nebula shadow-nebula hover:opacity-95 transition"
                  >
                    <span>Duyệt phụ đề</span>
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-100">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-500">
                <span>
                  Bắt đầu xử lý:{" "}
                  <strong className="font-mono font-medium text-neutral-800 tabular-nums">
                    {formatDateTime(data.startedAt ?? undefined)}
                  </strong>
                </span>
                {data.completedAt && (
                  <span>
                    Hoàn tất lúc:{" "}
                    <strong className="font-mono font-medium text-neutral-800 tabular-nums">
                      {formatDateTime(data.completedAt)}
                    </strong>
                  </span>
                )}
                {totalElapsed && (
                  <span>
                    Tổng thời gian:{" "}
                    <strong className="font-mono font-medium text-emerald-700 tabular-nums">
                      {totalElapsed}
                    </strong>
                  </span>
                )}
              </div>

              <PipelineStatusText status={data.overallStatus} className="font-semibold ml-auto" />
            </div>
          </section>

          {isFailed && (
            <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-5 shadow-xs flex items-start gap-3">
              <WarningCircle size={20} weight="fill" className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-neutral-900">
                  {failedInfo
                    ? `Sự cố tại Bước ${failedInfo.order}: ${failedInfo.label}`
                    : "Quá trình xử lý video gặp sự cố"}
                </h3>
                <p className="text-xs text-rose-800 leading-relaxed">{failureDetail}</p>
              </div>
            </div>
          )}

          <PipelineStepper steps={data.steps} />

          <PipelineLogPanel pipeline={data} updatedAt={dataUpdatedAt} />
        </div>
      )}
    </div>
  );
}

function PipelineLoadingFallback() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="h-28 bg-white rounded-2xl border border-purple-100 animate-pulse" />
      <div className="h-44 bg-white rounded-2xl border border-purple-100 animate-pulse" />
      <div className="h-52 bg-white rounded-2xl border border-purple-100 animate-pulse" />
    </div>
  );
}

export default function VideoPipelinePage() {
  return (
    <Suspense fallback={<PipelineLoadingFallback />}>
      <PipelineContent />
    </Suspense>
  );
}
