import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục không vượt quá 50 ký tự"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug đường dẫn phải có ít nhất 2 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang (-)"),
  description: z.string().trim().max(200, "Mô tả tối đa 200 ký tự").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CategoryFormSchemaType = z.infer<typeof categoryFormSchema>;
