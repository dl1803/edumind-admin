'use client';

import React from 'react';
import Link from 'next/link';
import {
  CurrencyCircleDollar,
  Users,
  Sparkle,
  FilmStrip,
  ArrowUpRight,
  ArrowDownRight,
  WarningCircle,
  HourglassSimple,
} from '@phosphor-icons/react';
import { KpiStat } from '@/types/dashboard.types';

interface KpiCardProps {
  stat: KpiStat;
}

export function KpiCard({ stat }: KpiCardProps) {
  const config = {
    revenue: {
      borderColor: 'border-l-[#059669]',
      iconBg: 'bg-emerald-50 text-[#059669]',
      icon: <CurrencyCircleDollar size={20} weight="fill" />,
    },
    students: {
      borderColor: 'border-l-[#7C3AED]',
      iconBg: 'bg-purple-50 text-[#7C3AED]',
      icon: <Users size={20} weight="fill" />,
    },
    ai_questions: {
      borderColor: 'border-l-[#8B5CF6]',
      iconBg: 'bg-purple-100 text-[#7C3AED]',
      icon: <Sparkle size={20} weight="fill" />,
    },
    videos: {
      borderColor: 'border-l-[#D97706]',
      iconBg: 'bg-amber-50 text-[#D97706]',
      icon: <FilmStrip size={20} weight="fill" />,
    },
  }[stat.type];

  const content = (
    <div
      className={`bg-white rounded-xl border border-purple-100/90 border-l-4 ${config.borderColor} shadow-xs p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer group h-full`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {stat.label}
            </span>
            {stat.type === 'ai_questions' && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center gap-0.5">
                <Sparkle size={10} weight="bold" /> AI
              </span>
            )}
          </div>
          <div
            className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center text-lg group-hover:scale-105 transition`}
          >
            {config.icon}
          </div>
        </div>

        {stat.type === 'videos' ? (
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-[22px] font-bold text-neutral-900 font-mono tracking-tight">
              {stat.value}
            </p>
            {stat.errorCount ? (
              <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-0.5">
                <WarningCircle size={12} weight="bold" /> {stat.errorCount} lỗi
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-[22px] font-bold text-neutral-900 font-mono mt-1.5 tracking-tight">
            {stat.value}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
        {stat.type === 'videos' ? (
          <>
            <span className="text-amber-700 font-medium flex items-center gap-1.5">
              <HourglassSimple size={14} weight="fill" /> {stat.statusText}
            </span>
            <span className="text-purple-700 font-semibold text-[11px] group-hover:underline">
              Chi tiết →
            </span>
          </>
        ) : (
          <>
            <span
              className={`font-bold flex items-center gap-1 ${
                stat.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {stat.isPositive ? (
                <ArrowUpRight size={14} weight="bold" />
              ) : (
                <ArrowDownRight size={14} weight="bold" />
              )}
              {stat.isPositive ? `+${stat.deltaPercent}%` : `-${stat.deltaPercent}%`}
            </span>
            <span className="text-neutral-400 text-[11px]">{stat.deltaLabel}</span>
          </>
        )}
      </div>
    </div>
  );

  return stat.linkHref ? <Link href={stat.linkHref}>{content}</Link> : content;
}
