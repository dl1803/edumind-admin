import { z } from "zod";

export const videoUploadSchema = z.object({
  courseId: z.string().min(1, "Vui lòng chọn khóa học"),
  lessonId: z.string().min(1, "Vui lòng chọn bài học cho video này"),
});

export type VideoUploadFormValues = z.infer<typeof videoUploadSchema>;

