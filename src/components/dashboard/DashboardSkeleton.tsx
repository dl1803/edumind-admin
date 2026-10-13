'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          'border-l-emerald-300',
          'border-l-purple-300',
          'border-l-purple-300',
          'border-l-amber-300',
        ].map((borderCol, idx) => (
          <div
            key={idx}
            className={`h-28 bg-white rounded-xl border border-purple-100/80 border-l-4 ${borderCol} p-5 space-y-3 relative overflow-hidden`}
          >
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-3 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-28 h-3 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 bg-white p-6 rounded-xl border border-purple-100/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="w-36 h-4 rounded" />
              <Skeleton className="w-56 h-3 rounded" />
            </div>
            <Skeleton className="w-40 h-7 rounded-lg" />
          </div>
          <Skeleton className="w-full h-52 rounded-lg" />
        </div>

        <div className="xl:col-span-5 bg-white p-6 rounded-xl border border-purple-100/80 shadow-xs space-y-4">
          <div className="space-y-2">
            <Skeleton className="w-36 h-4 rounded" />
            <Skeleton className="w-48 h-3 rounded" />
          </div>
          <Skeleton className="w-full h-52 rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-purple-100/80 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-24 h-3 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-full h-10 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-purple-100/80 shadow-xs p-6 space-y-4">
        <Skeleton className="w-44 h-4 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
