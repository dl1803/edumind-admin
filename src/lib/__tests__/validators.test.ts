import { loginSchema } from '../validators';

describe('Admin Login Zod Schema Validation', () => {
  it('should validate valid admin credentials successfully', () => {
    const validData = {
      email: 'admin@edumind.edu.vn',
      password: 'AdminPassword@123',
      rememberMe: true,
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@edumind.edu.vn');
      expect(result.data.password).toBe('AdminPassword@123');
      expect(result.data.rememberMe).toBe(true);
    }
  });

  it('should allow omitting rememberMe field', () => {
    const validData = {
      email: 'admin@edumind.edu.vn',
      password: 'AdminPassword@123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when email is empty', () => {
    const emptyEmail = {
      email: '',
      password: 'AdminPassword@123',
    };
    const result = loginSchema.safeParse(emptyEmail);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Vui lòng nhập email quản trị');
    }
  });

  it('should fail when email format is invalid', () => {
    const invalidEmails = ['not-an-email', 'admin@', '@domain.com', 'admin@domain'];
    for (const email of invalidEmails) {
      const result = loginSchema.safeParse({
        email,
        password: 'AdminPassword@123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Định dạng email không hợp lệ');
      }
    }
  });

  it('should fail when password is empty', () => {
    const emptyPassword = {
      email: 'admin@edumind.edu.vn',
      password: '',
    };
    const result = loginSchema.safeParse(emptyPassword);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Vui lòng nhập mật khẩu');
    }
  });

  it('should fail when password is shorter than 8 characters', () => {
    const shortPassword = {
      email: 'admin@edumind.edu.vn',
      password: 'short',
    };
    const result = loginSchema.safeParse(shortPassword);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mật khẩu phải có ít nhất 8 ký tự');
    }
  });
});
