'use client';

import React from 'react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartWrapper({
  title,
  subtitle,
  actions,
  footer,
  children,
  className = '',
}: ChartWrapperProps) {
  return (
    <div
      className={`bg-white p-6 rounded-xl border border-purple-100/80 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>

        <div className="w-full relative pt-2 min-h-[220px]">
          {children}
        </div>
      </div>

      {footer && (
        <div className="mt-2 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          {footer}
        </div>
      )}
    </div>
  );
}
