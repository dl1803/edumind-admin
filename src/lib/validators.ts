import * as z from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email quản trị')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
