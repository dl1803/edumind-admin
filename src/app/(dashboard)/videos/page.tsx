"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Article,
  CloudArrowUp,
  Cpu,
  FilmStrip,
  MagnifyingGlass,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TopBarContent } from "@/context/TopBarContext";
import { useVideos } from "@/hooks/useVideos";
import { toast } from "@/hooks/useToast";
import { videoService } from "@/services/video.service";
import { formatDateTime } from "@/lib/utils";
import { PipelineStatusText } from "@/components/video/PipelineStatusText";
import { VideoThumbnail } from "@/components/video/VideoThumbnail";
import { VideoActionMenu } from "@/components/video/VideoActionMenu";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Pagination } from "@/components/ui/Pagination";
import type {
  VideoListParams,
  VideoListSort,
  VideoOverallStatus,
} from "@/types/video.types";

interface ListQuery {
  search: string;
  course: string;
  status: VideoOverallStatus | "";
  sort: VideoListSort;
  page: number;
  pageSize: number;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT: VideoListSort = "newest";

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Hoàn tất", value: "completed" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Đang tải lên", value: "uploading" },
  { label: "Chờ xử lý", value: "uploaded" },
  { label: "Lỗi", value: "failed" },
];

const COURSE_OPTIONS = [
  { label: "Tất cả khóa học", value: "" },
  { label: "Nhập môn Lập trình Python", value: "Nhập môn Lập trình Python" },
  { label: "Xây dựng Ứng dụng RAG Thông minh", value: "Xây dựng Ứng dụng RAG Thông minh" },
  { label: "Thiết kế Giao diện UI/UX Nâng cao", value: "Thiết kế Giao diện UI/UX Nâng cao" },
];

const PAGE_SIZE_OPTIONS = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
];

const ROW_LINK_ACTIONS: Record<
  Exclude<VideoOverallStatus, "failed">,
  {
    label: string;
    getHref: (videoId: string) => string;
    Icon: typeof Article;
    className: string;
  }
> = {
  completed: {
    label: "Duyệt phụ đề",
    getHref: (videoId) => `/videos/transcript?videoId=${encodeURIComponent(videoId)}`,
    Icon: Article,
    className:
      "border-purple-200 bg-white text-purple-700 hover:bg-purple-50 hover:border-purple-300",
  },
  processing: {
    label: "Tiến trình",
    getHref: (videoId) => `/videos/pipeline?videoId=${encodeURIComponent(videoId)}`,
    Icon: Cpu,
    className:
      "border-amber-200 bg-white text-amber-800 hover:bg-amber-50 hover:border-amber-300",
  },
  uploading: {
    label: "Tiến trình",
    getHref: (videoId) => `/videos/pipeline?videoId=${encodeURIComponent(videoId)}`,
    Icon: Cpu,
    className:
      "border-amber-200 bg-white text-amber-800 hover:bg-amber-50 hover:border-amber-300",
  },
  uploaded: {
    label: "Tiến trình",
    getHref: (videoId) => `/videos/pipeline?videoId=${encodeURIComponent(videoId)}`,
    Icon: Cpu,
    className:
      "border-neutral-200 bg-white text-neutral-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200",
  },
};

function parseStatus(value: string | null): VideoOverallStatus | "" {
  const matched = STATUS_OPTIONS.find((s) => s.value === value);
  return matched ? (matched.value as VideoOverallStatus | "") : "";
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function VideosContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [openMenuVideoId, setOpenMenuVideoId] = useState<string | null>(null);

  const retryMutation = useMutation({
    mutationFn: (videoId: string) => videoService.retryPipelineStep(videoId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline", result.videoId] });
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể thử lại tiến trình.");
    },
  });

  const query: ListQuery = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      course: searchParams.get("course") || "",
      status: parseStatus(searchParams.get("status")),
      sort: (searchParams.get("sort") === "oldest" ? "oldest" : DEFAULT_SORT) as VideoListSort,
      page: parsePositiveInt(searchParams.get("page"), 1),
      pageSize: parsePositiveInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
    }),
    [searchParams]
  );

  const updateQuery = useCallback(
    (patch: Partial<ListQuery>) => {
      const next = { ...query, ...patch };
      const nextParams = new URLSearchParams();
      if (next.search) nextParams.set("search", next.search);
      if (next.course) nextParams.set("course", next.course);
      if (next.status) nextParams.set("status", next.status);
      if (next.sort !== DEFAULT_SORT) nextParams.set("sort", next.sort);
      if (next.page > 1) nextParams.set("page", String(next.page));
      if (next.pageSize !== DEFAULT_PAGE_SIZE) nextParams.set("pageSize", String(next.pageSize));
      const queryString = nextParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, query, router]
  );

  const listParams: VideoListParams = useMemo(
    () => ({
      search: query.search || undefined,
      courseTitle: query.course || undefined,
      status: query.status || undefined,
      sort: query.sort,
      page: query.page,
      limit: query.pageSize,
    }),
    [query]
  );

  const { data, isLoading, isError, refetch } = useVideos(listParams);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.ceil(total / query.pageSize) || 1;
  const fromIndex = total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const toIndex = Math.min(query.page * query.pageSize, total);
  const isFiltered = Boolean(query.search || query.course || query.status);

  return (
    <div className="space-y-5">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Video &amp; Xử lý AI</span>
            <span className="text-neutral-300">/</span>
            <h1 className="text-sm font-bold text-neutral-900">Kho video bài học</h1>
          </div>
        }
        actions={
          <Link
            href="/videos/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white grad-nebula shadow-nebula hover:opacity-95 font-semibold text-xs transition cursor-pointer"
          >
            <CloudArrowUp size={16} weight="bold" />
            <span>Tải lên video mới</span>
          </Link>
        }
      />

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-red-600" />
            <span>Không thể tải danh sách video. Vui lòng thử lại.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-100/70 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <ArrowClockwise size={14} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* FILTER BAR VỚI SELECT DROPDOWN DÙNG CHUNG BO GÓC MỀM MẠI */}
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <MagnifyingGlass
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={query.search}
              onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
              placeholder="Tìm tên video, bài học liên kết..."
              className="w-full pl-8 pr-8 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white text-neutral-800 transition"
            />
            {query.search && (
              <button
                type="button"
                onClick={() => updateQuery({ search: "", page: 1 })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                title="Xóa tìm kiếm"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="w-56">
            <SelectDropdown
              value={query.course}
              placeholder="Tất cả khóa học"
              options={COURSE_OPTIONS}
              onChange={(val) => updateQuery({ course: val, page: 1 })}
              fullWidth
            />
          </div>

          <div className="w-52">
            <SelectDropdown
              value={query.status}
              placeholder="Tất cả trạng thái"
              options={STATUS_OPTIONS}
              onChange={(val) => updateQuery({ status: parseStatus(val), page: 1 })}
              fullWidth
            />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={() => updateQuery({ search: "", course: "", status: "", page: 1 })}
              className="px-3 py-2 rounded-xl text-neutral-500 hover:text-purple-700 hover:bg-purple-50 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-purple-200"
            >
              <ArrowCounterClockwise size={13} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE THIẾT KẾ CÂN ĐỐI 6 CỘT - CĂN GIỮA TIÊU ĐỀ KHÔNG RỚT DÒNG, CỘT KHÔNG VA CHẠM */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-visible">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full table-fixed text-left border-collapse min-w-[1150px]" aria-label="Bảng dữ liệu kho video">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-[27%] whitespace-nowrap align-middle">Video &amp; Bài học</th>
                <th className="py-3.5 px-4 text-center w-[20%] whitespace-nowrap align-middle">Khóa học</th>
                <th className="py-3.5 px-4 text-center w-[10%] whitespace-nowrap align-middle">Dung lượng</th>
                <th className="py-3.5 px-4 text-center w-[16%] whitespace-nowrap align-middle">Trạng thái Pipeline</th>
                <th className="py-3.5 px-4 text-center w-[10%] whitespace-nowrap align-middle">Ngày tải lên</th>
                <th className="py-3.5 px-4 text-center w-[17%] whitespace-nowrap align-middle">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-3 w-full max-w-[270px]">
                          <div className="w-16 h-10 rounded-md bg-neutral-200 shrink-0" />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="h-3 w-3/4 bg-neutral-200 rounded" />
                            <div className="h-2.5 w-1/2 bg-neutral-100 rounded" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <div className="h-3 w-3/4 mx-auto bg-neutral-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <div className="h-3 w-12 mx-auto bg-neutral-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <div className="h-3 w-16 mx-auto bg-neutral-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <div className="h-3 w-16 mx-auto bg-neutral-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <div className="h-3 w-20 mx-auto bg-neutral-200 rounded" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    {isFiltered ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-neutral-700">Không tìm thấy video phù hợp</p>
                        <p className="text-xs text-neutral-400">Thử thay đổi từ khóa hoặc bộ lọc để xem các video khác.</p>
                        <button
                          type="button"
                          onClick={() => updateQuery({ search: "", course: "", status: "", page: 1 })}
                          className="px-4 py-2 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold text-xs transition cursor-pointer"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    ) : (
                      <div className="w-[480px] max-w-full mx-auto p-6 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-4 shadow-2xs">
                          <FilmStrip size={36} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-900 mb-2">Chưa có video bài giảng nào</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mb-6">
                          Hãy tải lên video bài giảng đầu tiên để hệ thống tự động xử lý HLS, phụ đề và nạp tri thức cho AI Trợ giảng.
                        </p>
                        <Link
                          href="/videos/upload"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white grad-nebula shadow-nebula hover:opacity-95 font-semibold text-xs transition cursor-pointer"
                        >
                          <CloudArrowUp size={16} weight="bold" />
                          <span>Tải lên video đầu tiên</span>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((row, index) => {
                  const isMenuOpen = openMenuVideoId === row.videoId;
                  const isNearBottom = index >= items.length - 2 && items.length > 3;

                  return (
                    <tr
                      key={row.videoId}
                      className={`transition ${isMenuOpen
                          ? "bg-purple-50/40 relative z-30"
                          : row.overallStatus === "processing"
                            ? "bg-amber-50/15 hover:bg-amber-50/30"
                            : row.overallStatus === "failed"
                              ? "bg-rose-50/15 hover:bg-rose-50/30"
                              : "hover:bg-purple-50/30"
                        }`}
                    >
                      {/* CỘT 1: VIDEO & BÀI HỌC (28%) - CĂN GIỮA THEO CỘT, KHỐI NỘI DUNG 270PX CĂN TRÁI GỌN GÀNG */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-3 w-full max-w-[270px]">
                            <VideoThumbnail
                              src={row.thumbnailUrl}
                              alt={row.videoTitle || row.lessonTitle}
                              durationSec={row.durationSec}
                              status={row.overallStatus}
                            />
                            <div className="min-w-0 flex-1 overflow-hidden text-left">
                              <p
                                className="font-bold text-neutral-900 text-xs truncate max-w-full"
                                title={row.videoTitle || row.lessonTitle}
                              >
                                {row.videoTitle || row.lessonTitle}
                              </p>
                              {row.courseTitle ? (
                                <p
                                  className="text-[11px] text-neutral-400 truncate max-w-full mt-0.5"
                                  title={row.lessonTitle}
                                >
                                  {row.lessonTitle}
                                </p>
                              ) : (
                                <span className="text-[11px] text-amber-600 font-medium block mt-0.5 whitespace-nowrap">
                                  Chưa liên kết
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 2: KHÓA HỌC (20%) - CĂN GIỮA HOÀN TOÀN, TRUNCATE ... NẾU QUÁ DÀI */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <div className="min-w-0 overflow-hidden">
                          {row.courseTitle ? (
                            <span
                              className="font-medium text-neutral-800 text-xs truncate block max-w-full text-center"
                              title={row.courseTitle}
                            >
                              {row.courseTitle}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400 italic block text-center">—</span>
                          )}
                        </div>
                      </td>

                      {/* CỘT 3: DUNG LƯỢNG (10%) - CĂN GIỮA HOÀN TOÀN, KHÔNG RỚT DÒNG */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <span className="font-medium text-neutral-700 text-xs tabular-nums whitespace-nowrap">
                          {row.fileSizeMb ? `${row.fileSizeMb} MB` : "—"}
                        </span>
                      </td>

                      {/* CỘT 4: TRẠNG THÁI PIPELINE (16%) - CĂN GIỮA HOÀN TOÀN, KHÔNG RỚT DÒNG */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <span className="whitespace-nowrap inline-block">
                          <PipelineStatusText status={row.overallStatus} />
                        </span>
                      </td>

                      {/* CỘT 5: NGÀY TẢI LÊN (10%) - CĂN GIỮA HOÀN TOÀN, KHÔNG RỚT DÒNG */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <span className="font-medium text-xs text-neutral-500 tabular-nums whitespace-nowrap">
                          {formatDateTime(row.uploadedAt).split(" ")[0]}
                        </span>
                      </td>

                      {/* CỘT 6: THAO TÁC (17%) - NÚT HÀNH ĐỘNG RÕ RÀNG, CHỈ HIỆN MENU PHỤ KHI HOÀN TẤT HOẶC LỖI */}
                      <td className={`py-3.5 pl-3 pr-2 text-center align-middle ${isMenuOpen ? "relative z-30" : ""}`}>
                        <div className="relative flex items-center justify-center pr-8 min-h-[32px]">
                          {row.overallStatus === "failed" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuVideoId(null);
                                retryMutation.mutate(row.videoId);
                              }}
                              disabled={retryMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-2xs font-semibold text-xs whitespace-nowrap transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                            >
                              <ArrowClockwise
                                size={13}
                                weight="bold"
                                className={`shrink-0 ${
                                  retryMutation.isPending && retryMutation.variables === row.videoId
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                              <span>
                                {retryMutation.isPending && retryMutation.variables === row.videoId
                                  ? "Đang thử lại..."
                                  : "Thử lại"}
                              </span>
                            </button>
                          ) : (
                            (() => {
                              const action = ROW_LINK_ACTIONS[row.overallStatus];
                              if (!action) return null;
                              const ActionIcon = action.Icon;
                              return (
                                <Link
                                  href={action.getHref(row.videoId)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-2xs font-semibold text-xs whitespace-nowrap transition active:scale-[0.98] cursor-pointer ${action.className}`}
                                >
                                  <ActionIcon size={13} weight="bold" className="shrink-0" />
                                  <span>{action.label}</span>
                                </Link>
                              );
                            })()
                          )}

                          {(row.overallStatus === "completed" || row.overallStatus === "failed") && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                              <VideoActionMenu
                                video={row}
                                isOpen={isMenuOpen}
                                onOpenChange={(open) => setOpenMenuVideoId(open ? row.videoId : null)}
                                dropUp={isNearBottom}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG ĐỒNG BỘ 100% VỚI COMPONENT DÙNG CHUNG CỦA WEB */}
        {total > 0 && (
          <div className="px-6 py-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-3">
              <span>
                Hiển thị{" "}
                <strong className="text-neutral-800 font-bold tabular-nums">
                  {fromIndex} - {toIndex}
                </strong>{" "}
                trong tổng số{" "}
                <strong className="text-neutral-800 font-bold tabular-nums">
                  {total}
                </strong>{" "}
                video
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span>Dòng:</span>
                <SelectDropdown
                  value={String(query.pageSize)}
                  options={PAGE_SIZE_OPTIONS}
                  onChange={(val) => updateQuery({ pageSize: Number(val), page: 1 })}
                  size="sm"
                  placement="top"
                  className="bg-white"
                />
              </div>
            </div>

            <Pagination
              page={query.page}
              pageCount={totalPages}
              onPageChange={(p) => updateQuery({ page: p })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VideosLoadingSkeleton() {
  return <div className="h-96 bg-white rounded-xl border border-purple-100 animate-pulse" />;
}

export default function VideosPage() {
  return (
    <Suspense fallback={<VideosLoadingSkeleton />}>
      <VideosContent />
    </Suspense>
  );
}
