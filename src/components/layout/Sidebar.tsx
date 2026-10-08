'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SquaresFour,
  BookOpen,
  FilmStrip,
  Database,
  ListChecks,
  ChalkboardTeacher,
  Users,
  CurrencyCircleDollar,
  ChartBar,
  Gear,
  SignOut,
  IconProps,
} from '@phosphor-icons/react';
import { ADMIN_MENU_ITEMS } from '@/config/menu';
import { TokenStorage  } from '@/lib/token-storage';

// Bản đồ Icon Phosphor
const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  SquaresFour,
  BookOpen,
  FilmStrip,
  Database,
  ListChecks,
  ChalkboardTeacher,
  Users,
  CurrencyCircleDollar,
  ChartBar,
  Gear,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    TokenStorage.clearTokens();
    router.push('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white fixed left-0 top-0 z-30 flex flex-col justify-between border-r border-purple-100 shadow-[2px_0_12px_rgba(124,58,237,0.03)] select-none">
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-purple-100 bg-purple-50/20">
          <Image
            src="/Logo_khongnen.png"
            alt="EduMind Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain drop-shadow-[0_4px_10px_rgba(124,58,237,0.15)]"
            priority
          />
          <div className="min-w-0">
            <span className="text-xl font-black tracking-tight leading-none block text-nebula">
              EduMind
            </span>
            <span className="text-[10px] text-purple-700 font-mono tracking-wider uppercase block mt-1 font-bold">
              Admin Portal
            </span>
          </div>
        </div>

        {/* 10 Navigation Menu Items */}
        <nav className="p-3.5 space-y-1" aria-label="Admin Navigation">
          {ADMIN_MENU_ITEMS.map((item) => {
            const IconComponent = ICON_MAP[item.iconName] || SquaresFour;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition duration-150 ${
                  isActive
                    ? 'bg-purple-50 text-purple-800 font-bold border-l-4 border-purple-600 shadow-2xs'
                    : 'text-neutral-600 hover:bg-purple-50/70 hover:text-purple-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent
                    size={18}
                    weight={isActive ? 'fill' : 'regular'}
                    className={isActive ? 'text-purple-600' : 'text-purple-500'}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span
                    className={
                      item.href === '/videos'
                        ? 'px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-bold border border-amber-200'
                        : 'px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold'
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout Footer */}
      <div className="p-3.5 border-t border-purple-100 bg-purple-50/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
              QT
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">Trần Quản Trị</p>
              <p className="text-[10px] text-purple-600 font-mono truncate font-medium">
                Quản trị viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg hover:bg-purple-100 text-neutral-400 hover:text-red-600 flex items-center justify-center transition"
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
