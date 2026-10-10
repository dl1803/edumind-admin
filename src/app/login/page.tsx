'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EnvelopeSimple, LockKey, Eye, EyeSlash, ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { authService } from '@/services/auth.service';

const loginSchema = z.object({
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

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(false);
    setTimeout(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 250);
    }, 10);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: 'admin@edumind.edu.vn',
      password: '',
      rememberMe: true,
    },
  });

  const clearServerError = () => {
    if (serverError) setServerError(null);
  };

  const onError = () => {
    triggerShake();
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await authService.login(data);
      router.replace(redirectUrl);
    } catch (err: any) {
      triggerShake();
      if (
        err?.code === 'ERR_NETWORK' ||
        err?.message === 'Network Error' ||
        err?.message?.includes('network') ||
        err?.message?.includes('fetch') ||
        (!err?.response && err?.request) ||
        [502, 503, 504].includes(err?.response?.status)
      ) {
        setServerError('Mất kết nối máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      } else if (
        err?.response?.status === 401 ||
        err?.response?.data?.error?.code === 'INVALID_CREDENTIALS' ||
        err?.message?.includes('Email hoặc mật khẩu không chính xác') ||
        err?.message?.includes('Tài khoản hoặc mật khẩu không chính xác')
      ) {
        setServerError('Tài khoản hoặc mật khẩu không chính xác.');
      } else if (
        err?.response?.status === 403 ||
        err?.response?.data?.error?.code === 'FORBIDDEN' ||
        err?.message?.includes('không có quyền')
      ) {
        setServerError('Tài khoản không có quyền quản trị / đã bị khóa.');
      } else {
        const errorMsg =
          err?.response?.data?.error?.message ||
          err?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
        setServerError(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4FC] flex flex-col justify-between items-center py-4 px-4 sm:px-8 select-none">
      {/* Top Header Logo */}
      <header className="w-full shrink-0 pt-1 flex items-center justify-start relative z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo_khongnen.png"
            alt="EduMind Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain drop-shadow-[0_4px_14px_rgba(124,58,237,0.20)]"
            priority
          />
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-nebula">
              EduMind
            </span>
            <span className="text-[10px] sm:text-[11px] text-purple-700 font-mono tracking-wider uppercase ml-2.5 font-bold px-2 py-0.5 bg-purple-100/80 rounded-md border border-purple-200">
              Admin Portal
            </span>
          </div>
        </div>
      </header>

      {/* Center Login Card */}
      <main
        className={`w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(124,58,237,0.08)] border relative z-10 my-auto shrink-0 transition-all duration-300 ${
          isShaking ? 'animate-shake' : ''
        } ${serverError ? 'border-red-200' : 'border-purple-100/90'}`}
      >
        {/* Logo EduMind trên form login - tỷ lệ nhỏ gọn, không gây đẩy tràn màn hình */}
        <div className="text-center mb-4 sm:mb-5">
          <Image
            src="/Logo_khongnen.png"
            alt="EduMind Logo"
            width={64}
            height={64}
            className="w-16 h-auto mx-auto mb-2 object-contain drop-shadow-[0_6px_16px_rgba(124,58,237,0.20)]"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-black text-nebula tracking-tight">
            Quản trị hệ thống
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Đăng nhập tài khoản quản trị viên để vào Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3.5">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Email quản trị viên
            </label>
            <div className="relative">
              <EnvelopeSimple
                size={18}
                className="text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                {...register('email', { onChange: clearServerError })}
                onFocus={clearServerError}
                type="email"
                placeholder="admin@edumind.edu.vn"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-xs text-neutral-900 placeholder:text-neutral-400 placeholder:font-sans font-sans outline-none transition bg-neutral-50/50 ${
                  errors.email || serverError
                    ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100'
                    : 'border-neutral-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-[11px] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <LockKey
                size={18}
                className="text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                {...register('password', { onChange: clearServerError })}
                onFocus={clearServerError}
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-xs text-neutral-900 placeholder:text-neutral-400 placeholder:font-sans font-sans outline-none transition bg-neutral-50/50 ${
                  errors.password || serverError
                    ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100'
                    : 'border-neutral-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition p-0.5"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-[11px] mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
            {serverError && !errors.password && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 font-medium">
                <WarningCircle size={14} weight="fill" className="shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="w-4 h-4 rounded accent-[#7C3AED] text-purple-600 focus:ring-purple-500 border-purple-300 cursor-pointer"
              />
              <span className="text-xs text-neutral-600">Ghi nhớ đăng nhập trên thiết bị này</span>
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="text-[11px] text-purple-700 hover:text-purple-900 hover:underline font-medium shrink-0 ml-2"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-lg grad-nebula grad-nebula-hover hover:opacity-95 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs shadow-brand-glow transition flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập vào hệ thống</span>
                <ArrowRight size={14} weight="bold" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full shrink-0 text-center text-xs text-neutral-400 relative z-10 pt-3 pb-2">
        <p>© 2026 EduMind • Cổng thông tin Quản trị nội bộ • Phiên bản 1.0.0</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
}

