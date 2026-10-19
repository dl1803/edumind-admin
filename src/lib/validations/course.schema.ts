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
