import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outlined" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      fullWidth = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantClasses: Record<ButtonVariant, string> = {
      primary: "bg-nebula text-white hover:brightness-95 active:brightness-90",
      outlined: "border border-primary-600 text-primary-700 bg-transparent hover:bg-primary-50",
      ghost: "text-primary-700 bg-transparent hover:bg-primary-50",
      destructive: "bg-error-600 text-white hover:brightness-90",
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "h-9 px-4 rounded-xl text-sm",
      md: "h-12 px-6 rounded-xl text-sm",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="mr-2 inline-flex">{leftIcon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
