"use client";

import * as React from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === "password";
    const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={actualType}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "h-12 w-full rounded-lg border px-3 text-base outline-none transition-colors disabled:bg-neutral-100 disabled:text-neutral-400",
              error
                ? "border-error-600 focus:border-error-600 focus:ring-1 focus:ring-error-600"
                : "border-neutral-400 focus:border-primary-600 focus:ring-1 focus:ring-primary-600",
              isPasswordType && "pr-10",
              className
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 focus:outline-none"
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1 text-sm text-error-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-neutral-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            "min-h-[96px] w-full resize-y rounded-lg border px-3 py-2 text-base outline-none transition-colors disabled:bg-neutral-100",
            error
              ? "border-error-600 focus:border-error-600"
              : "border-neutral-400 focus:border-primary-600",
            className
          )}
          {...props}
        />
        {error && <p role="alert" className="mt-1 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
