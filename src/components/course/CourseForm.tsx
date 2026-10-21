"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseFormSchema, CourseFormSchemaType } from "@/lib/validations/course.schema";
import { CourseFormValues } from "@/types/course.types";
import { useCourseCategories, useCourseInstructors } from "@/hooks/useCourses";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { SyllabusEditor } from "./SyllabusEditor";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  UploadSimple,
  ArrowsClockwise,
  Trash,
  PlusCircle,
  Check,
  Warning,
  Info,
  Tag,
  ChalkboardTeacher,
  CurrencyCircleDollar,
  TreeStructure,
  CircleNotch,
} from "@phosphor-icons/react";

export interface CourseFormRef {
  requestCancel: () => boolean;
}

interface CourseFormProps {
  initialValues?: Partial<CourseFormValues>;
  onSubmit: (values: CourseFormValues) => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export const CourseForm = forwardRef<CourseFormRef, CourseFormProps>(function CourseForm(
  { initialValues, onSubmit, isSubmitting = false, isEditMode = false },
  ref
) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"info" | "syllabus">("info");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewThumbnail, setPreviewThumbnail] = useState<string>(
    initialValues?.thumbnailUrl || ""
  );

  const { data: categories = [] } = useCourseCategories();
  const { data: instructors = [] } = useCourseInstructors();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      shortDescription: initialValues?.shortDescription || "",
      description: initialValues?.description || "",
      categoryId: initialValues?.categoryId || "",
      instructorId: initialValues?.instructorId || "",
      priceVnd: initialValues?.priceVnd ?? 0,
      thumbnailUrl: initialValues?.thumbnailUrl || "",
      status: initialValues?.status || "DRAFT",
      chapters: initialValues?.chapters || [],
    },
  });

  const chapters = watch("chapters");
  const currentStatus = watch("status");

  const isFormModified = () => {
    const vals = getValues();
    const hasFieldChanges =
      (vals.title?.trim() !== (initialValues?.title || "").trim()) ||
      (vals.shortDescription?.trim() !== (initialValues?.shortDescription || "").trim()) ||
      (vals.description?.trim() !== (initialValues?.description || "").trim()) ||
      (vals.categoryId !== (initialValues?.categoryId || "")) ||
      (vals.instructorId !== (initialValues?.instructorId || "")) ||
      (Number(vals.priceVnd) !== (initialValues?.priceVnd ?? 0)) ||
      (vals.status !== (initialValues?.status || "DRAFT"));

    return (
      isDirty ||
      hasFieldChanges ||
      previewThumbnail !== (initialValues?.thumbnailUrl || "") ||
      JSON.stringify(vals.chapters || []) !== JSON.stringify(initialValues?.chapters || [])
    );
  };

  const handleCancelClick = () => {
    if (isFormModified()) {
      setShowCancelModal(true);
      return false;
    }
    router.push("/courses");
    return true;
  };

  useImperativeHandle(ref, () => ({
    requestCancel: handleCancelClick,
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewThumbnail(objectUrl);
      setValue("thumbnailUrl", objectUrl, { shouldDirty: true });
    }
  };

  const handleRemoveThumbnail = () => {
    setPreviewThumbnail("");
    setValue("thumbnailUrl", "", { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      {/* Thanh tab căn giữa và căn đều chuẩn theo phong cách A-05 Course Detail */}
      <div className="bg-white border-b border-purple-100 grid grid-cols-2 shrink-0 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 text-center ${
            activeTab === "info"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-neutral-500 hover:text-purple-700 font-semibold"
          }`}
        >
          <Info size={16} />
          <span>Thông tin cơ bản</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("syllabus")}
          className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 text-center ${
            activeTab === "syllabus"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-neutral-500 hover:text-purple-700 font-semibold"
          }`}
        >
          <TreeStructure size={16} />
          <span>Cấu trúc bài giảng ({chapters?.length || 0})</span>
        </button>
      </div>

      {activeTab === "info" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2 border-b border-purple-50 pb-3">
                <Info size={16} className="text-purple-600" />
                <span>Thông tin cơ bản khóa học</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="Ví dụ: Nhập môn Lập trình Python với AI Trợ giảng tương tác..."
                  className={`w-full px-3.5 py-2.5 text-xs bg-neutral-50 border rounded-lg focus:outline-none focus:ring-2 font-medium text-neutral-900 transition ${
                    errors.title
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-neutral-200 focus:border-purple-600 focus:ring-purple-500/20"
                  }`}
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  {...register("shortDescription")}
                  placeholder="Tóm tắt ngắn gọn khóa học trong 1-2 câu..."
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Mô tả chi tiết khóa học <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.description?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4">
              <div className="border-b border-purple-50 pb-3">
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <UploadSimple size={16} className="text-purple-600" />
                  <span>Ảnh bìa khóa học</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Hình ảnh hiển thị đại diện trên catalog và trang chi tiết.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              {previewThumbnail ? (
                <div className="relative group overflow-hidden rounded-xl border border-purple-200 bg-purple-50 aspect-video shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewThumbnail}
                    alt="Ảnh bìa khóa học"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-3 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/95 hover:bg-white text-neutral-800 text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition"
                    >
                      <ArrowsClockwise size={14} />
                      <span>Đổi ảnh</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="px-3 py-1.5 bg-white/95 hover:bg-red-50 text-red-600 text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition"
                    >
                      <Trash size={14} />
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (
                      file &&
                      (file.type === "image/jpeg" ||
                        file.type === "image/png" ||
                        file.type === "image/webp")
                    ) {
                      const objectUrl = URL.createObjectURL(file);
                      setPreviewThumbnail(objectUrl);
                      setValue("thumbnailUrl", objectUrl, { shouldDirty: true });
                    }
                  }}
                  className={`aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition p-6 text-center group ${
                    isDragging
                      ? "border-purple-600 bg-purple-100/70 scale-[1.01]"
                      : "border-purple-200 hover:border-purple-500 bg-purple-50/30 hover:bg-purple-50/60"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition duration-200 shadow-2xs">
                    <UploadSimple size={24} />
                  </div>
                  <span className="text-xs font-bold text-purple-900 group-hover:text-purple-700 transition">
                    Bấm để tải ảnh đại diện lên hoặc kéo thả vào đây
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-1 max-w-md">
                    Khuyến nghị độ phân giải <strong>1280×720px</strong> (tỉ lệ 16:9), dung lượng tối đa 5MB (JPG, PNG hoặc WebP).
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-purple-50 pb-2.5">
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={16} className="text-purple-600" />
                  <span>Phân loại danh mục</span>
                </h3>
                <Link
                  href="/courses/categories"
                  className="text-[10px] text-purple-600 hover:underline font-semibold flex items-center gap-0.5"
                >
                  + Tạo danh mục
                </Link>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-neutral-800 transition font-medium"
                >
                  <option value="">-- Chọn danh mục khóa học --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-50 pb-2.5">
                <ChalkboardTeacher size={16} className="text-purple-600" />
                <span>Giảng viên phụ trách</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Chọn giảng viên <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("instructorId")}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-neutral-800 transition font-medium"
                >
                  <option value="">-- Chọn giảng viên từ danh sách --</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} — {i.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Mỗi khóa học do 1 Giảng viên chính chịu trách nhiệm nội dung chuyên môn.
                </p>
                {errors.instructorId && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.instructorId.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-50 pb-2.5">
                <CurrencyCircleDollar size={16} className="text-purple-600" />
                <span>Cấu hình giá &amp; Trạng thái</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("priceVnd")}
                    placeholder="0"
                    className="w-full pl-3.5 pr-12 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 font-medium text-slate-900 tabular-nums transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                    VNĐ
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Nhập 0 nếu là khóa học miễn phí. Đơn vị tính: VNĐ.</p>
                {errors.priceVnd && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.priceVnd.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                  {!isEditMode ? "Trạng thái ban đầu *" : "Trạng thái xuất bản *"}
                </label>
                <select
                  {...register("status")}
                  disabled={!isEditMode}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 font-semibold text-neutral-800 transition ${
                    !isEditMode
                      ? "bg-slate-100 text-slate-500 border-neutral-200 cursor-not-allowed"
                      : "bg-neutral-50 border-neutral-200 focus:border-purple-600 focus:ring-purple-500/20"
                  }`}
                >
                  <option value="DRAFT">Bản nháp (Đang soạn thảo)</option>
                  <option value="PUBLISHED">Công khai (Đã xuất bản)</option>
                  <option value="ARCHIVED">Lưu trữ / Ẩn</option>
                </select>

                {!isEditMode ? (
                  <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                    Khóa học mới tạo mặc định ở trạng thái Bản nháp cho đến khi hoàn tất nội dung bài giảng.
                  </p>
                ) : (
                  <div className="mt-2 text-[11px] flex items-center gap-1.5 text-neutral-500">
                    <span>Trạng thái hiện tại:</span>
                    <span
                      className={`font-bold ${
                        currentStatus === "PUBLISHED"
                          ? "text-emerald-600"
                          : currentStatus === "DRAFT"
                          ? "text-amber-600"
                          : "text-neutral-500"
                      }`}
                    >
                      {currentStatus === "PUBLISHED"
                        ? "Đã xuất bản"
                        : currentStatus === "DRAFT"
                        ? "Bản nháp"
                        : "Lưu trữ"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "syllabus" && (
        <div className="max-w-4xl mx-auto">
          <SyllabusEditor
            chapters={chapters || []}
            onChange={(newChaps) => setValue("chapters", newChaps, { shouldDirty: true })}
          />
        </div>
      )}

      <div className="fixed bottom-0 left-64 right-0 h-16 bg-white border-t border-purple-100 px-8 flex items-center justify-between z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={handleCancelClick}
          className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold transition"
        >
          Hủy
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setValue("status", "DRAFT");
              handleSubmit(onSubmit)();
            }}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold transition disabled:opacity-50"
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)",
            }}
            className="px-6 py-2 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1.5">
                <CircleNotch size={16} weight="bold" className="animate-spin" />
                <span>{isEditMode ? "Đang cập nhật..." : "Đang tạo khóa học..."}</span>
              </div>
            ) : isEditMode ? (
              <>
                <Check size={16} weight="bold" />
                <span>Cập nhật thông tin</span>
              </>
            ) : (
              <>
                <PlusCircle size={16} weight="bold" />
                <span>Tạo khóa học</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Thay đổi chưa được lưu"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 text-amber-900">
            <Warning size={24} className="text-amber-600 shrink-0 mt-0.5" weight="bold" />
            <p className="text-xs leading-relaxed">
              {isEditMode
                ? "Các thay đổi bạn vừa chỉnh sửa sẽ không được lưu nếu bạn rời đi mà không nhấn Cập nhật thông tin."
                : "Các thông tin bạn vừa nhập sẽ bị hủy bỏ nếu bạn rời đi mà không nhấn Tạo khóa học."}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outlined" size="sm" onClick={() => setShowCancelModal(false)}>
              Tiếp tục chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => router.push("/courses")}
            >
              Rời đi không lưu
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
});
