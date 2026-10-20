import { z } from "zod";

export const courseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const courseFilterSchema = z.object({
  search: z.string().optional(),
  status: z.union([courseStatusSchema, z.literal("")]).optional(),
  categoryId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export type CourseFilterValues = z.infer<typeof courseFilterSchema>;

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Tiêu đề bài giảng không được để trống"),
  durationSeconds: z.number().optional().default(0),
  videoUrl: z.string().optional(),
  isPreview: z.boolean().optional().default(false),
  order: z.number().default(0),
});

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Tên chương không được để trống"),
  order: z.number().default(0),
  lessons: z.array(lessonSchema).default([]),
});

export const courseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Tên khóa học phải có ít nhất 5 ký tự")
    .max(200, "Tên khóa học không vượt quá 200 ký tự"),
  shortDescription: z
    .string()
    .trim()
    .max(255, "Mô tả ngắn tối đa 255 ký tự")
    .optional()
    .default(""),
  description: z
    .string()
    .trim()
    .min(10, "Mô tả chi tiết khóa học phải có ít nhất 10 ký tự"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục khóa học"),
  instructorId: z.string().min(1, "Vui lòng chọn giảng viên phụ trách"),
  priceVnd: z.coerce
    .number({ invalid_type_error: "Giá bán phải là số nguyên ≥ 0" })
    .min(0, "Giá bán không được âm (nhập 0 nếu miễn phí)"),
  thumbnailUrl: z.string().optional().default(""),
  status: courseStatusSchema.default("DRAFT"),
  chapters: z.array(chapterSchema).default([]),
});

export type CourseFormSchemaType = z.infer<typeof courseFormSchema>;
