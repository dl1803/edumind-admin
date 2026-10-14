"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import {
  useQuery,
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableColumn } from "@/components/data-table/types";
import { StatusText } from "@/components/data-table/status";
import { Course, CourseListParams } from "@/types/course.types";
import { courseService } from "@/services/course.service";
import { MOCK_COURSES } from "@/services/mock/course.mock";
import { Button } from "@/components/ui/Button";
import { Eye, PencilSimple, Trash } from "@phosphor-icons/react";

const queryClient = new QueryClient();

export default function DataTableDevWrapper() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DataTableDemoContent />
    </QueryClientProvider>
  );
}

function DataTableDemoContent() {
  const [activeTab, setActiveTab] = useState<"client" | "server">("client");

  const [clientData, setClientData] = useState<Course[]>(MOCK_COURSES);
  const [simulatedLoading, setSimulatedLoading] = useState(false);

  const [serverParams, setServerParams] = useState<CourseListParams>({
    page: 1,
    pageSize: 10,
    search: "",
    status: "",
    categoryId: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const { data: serverResult, isFetching: isServerLoading } = useQuery({
    queryKey: ["courses-dev", serverParams],
    queryFn: () => courseService.getCourses(serverParams),
    placeholderData: keepPreviousData,
  });

  const columns: DataTableColumn<Course>[] = [
    {
      key: "title",
      header: "Tên khóa học",
      sortable: true,
      width: "28%",
      cell: (row) => (
        <div className="min-w-0 py-1">
          <span className="font-bold text-neutral-900 hover:text-purple-700 transition-colors truncate block">
            {row.title}
          </span>
          <p className="text-[10px] text-neutral-400 font-medium mt-0.5 truncate">
            {row.chapterCount || 4} chương | {row.lessonCount} bài học
          </p>
        </div>
      ),
    },
    {
      key: "categoryName",
      header: "Danh mục",
      align: "center",
      width: "14%",
      cell: (row) => (
        <span className="text-xs font-medium text-neutral-700 truncate block">
          {row.categoryName || "Chưa phân loại"}
        </span>
      ),
    },
    {
      key: "priceVnd",
      header: "Giá bán",
      sortable: true,
      align: "center",
      width: "12%",
      cell: (row) => (
        <span className="font-semibold text-slate-900 tabular-nums whitespace-nowrap">
          {row.priceVnd.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      width: "12%",
      cell: (row) => <StatusText status={row.status} className="justify-center" />,
    },
    {
      key: "instructorName",
      header: "Giảng viên",
      align: "center",
      width: "14%",
      cell: (row) => (
        <span className="text-xs font-medium text-neutral-900 truncate block">
          {row.instructorName}
        </span>
      ),
    },
    {
      key: "studentCount",
      header: "Học viên",
      sortable: true,
      align: "center",
      width: "10%",
      cell: (row) => (
        <span className="font-medium text-slate-700 tabular-nums whitespace-nowrap">
          {row.studentCount.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      align: "center",
      width: "10%",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition"
            title="Chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition"
            title="Sửa"
          >
            <PencilSimple size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Xóa"
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            DataTable Preview & Verification
          </h1>
        </div>

        <div className="flex items-center p-1 bg-purple-50 rounded-xl border border-purple-200">
          <button
            type="button"
            onClick={() => setActiveTab("client")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "client"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            Client Mode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("server")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "server"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            Server Mode
          </button>
        </div>
      </div>

      {activeTab === "client" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-purple-100 text-xs">
            <span className="font-semibold text-neutral-700">Công cụ kiểm thử:</span>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setSimulatedLoading((prev) => !prev)}
            >
              {simulatedLoading ? "Tắt Skeleton Loading" : "Bật Skeleton (6 dòng shimmer)"}
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setClientData(clientData.length > 0 ? [] : MOCK_COURSES)}
            >
              {clientData.length > 0 ? "Xóa sạch dữ liệu (Xem Empty State)" : "Nạp lại 25 khóa học"}
            </Button>
          </div>

          <DataTable
            data={clientData}
            columns={columns}
            rowKey={(r) => r.id}
            mode="client"
            isLoading={simulatedLoading}
            skeletonRows={6}
            searchable={true}
            searchPlaceholder="Tìm theo tên khóa học hoặc giảng viên..."
            searchKeys={["title", "instructorName"]}
            filters={[
              {
                key: "status",
                label: "Tất cả trạng thái",
                options: [
                  { value: "PUBLISHED", label: "Đã xuất bản" },
                  { value: "DRAFT", label: "Bản nháp" },
                  { value: "ARCHIVED", label: "Đã lưu trữ" },
                ],
              },
            ]}
          />
        </div>
      )}

      {activeTab === "server" && (
        <div className="space-y-4">
          <DataTable
            data={serverResult?.items || []}
            columns={columns}
            rowKey={(r) => r.id}
            mode="server"
            isLoading={isServerLoading && !serverResult}
            skeletonRows={6}
            searchable={true}
            searchPlaceholder="Tìm kiếm qua Server Mock..."
            filters={[
              {
                key: "status",
                label: "Tất cả trạng thái",
                options: [
                  { value: "PUBLISHED", label: "Đã xuất bản" },
                  { value: "DRAFT", label: "Bản nháp" },
                  { value: "ARCHIVED", label: "Đã lưu trữ" },
                ],
              },
            ]}
            sort={
              serverParams.sortBy
                ? {
                    key: serverParams.sortBy,
                    direction: serverParams.sortDir || "asc",
                  }
                : null
            }
            onSortChange={(sort) => {
              setServerParams((prev) => ({
                ...prev,
                sortBy: sort?.key || "createdAt",
                sortDir: sort?.direction || "desc",
                page: 1,
              }));
            }}
            page={serverParams.page}
            pageSize={serverParams.pageSize}
            total={serverResult?.total || 0}
            onPageChange={(page) => {
              setServerParams((prev) => ({ ...prev, page }));
            }}
            onPageSizeChange={(pageSize) => {
              setServerParams((prev) => ({ ...prev, pageSize, page: 1 }));
            }}
            onSearchChange={(search) => {
              setServerParams((prev) => ({ ...prev, search, page: 1 }));
            }}
            onFilterChange={(key, val) => {
              setServerParams((prev) => ({ ...prev, [key]: val, page: 1 }));
            }}
          />
        </div>
      )}
    </div>
  );
}
