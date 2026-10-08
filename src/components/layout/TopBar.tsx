'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { MagnifyingGlass, User, SignOut, CaretDown } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { TokenStorage  } from '@/lib/token-storage';

export function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Đóng dropdown khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    TokenStorage.clearTokens();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-purple-100 px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Cụm Breadcrumb / Tiêu đề bên trái */}
      <div className="flex items-center gap-3">
        <Breadcrumb />
      </div>

      {/* Cụm công cụ bên phải */}
      <div className="flex items-center gap-4">
        {/* Search Bar nhanh */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="w-56 h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
        </div>

        {/* Chuông thông báo: Đồng bộ theo mẫu Prototype A-02 (SVG gradient Nebula + viền tím #7C3AED + badge 3) */}
        <button
          type="button"
          aria-label="Thông báo hệ thống"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-purple-50 transition-all relative"
        >
          <svg className="w-[22px] h-[22px]" viewBox="0 0 256 256" fill="none">
            <defs>
              <linearGradient id="bellNebulaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path
              d="M221.8 175.94c-5.55-9.56-13.8-23.61-13.8-71.94a80 80 0 0 0-72-79.6V16a8 8 0 0 0-16 0v8.4a80 80 0 0 0-72 79.6c0 48.33-8.25 62.38-13.81 71.94A16 16 0 0 0 48 200h40a40 40 0 0 0 80 0h40a16 16 0 0 0 13.8-24.06ZM128 216a24 24 0 0 1-22.62-16h45.24A24 24 0 0 1 128 216Z"
              fill="url(#bellNebulaGrad)"
              stroke="#7C3AED"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute top-0 right-0 w-[17px] h-[17px] rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-xs">
            <span className="text-[9px] font-bold text-white leading-none">3</span>
          </div>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-purple-50 transition"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              QT
            </div>
            <CaretDown size={14} className="text-neutral-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-purple-100 py-1.5 z-30 animate-fade-in">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-xs font-bold text-neutral-900">Trần Quản Trị</p>
                <p className="text-[10px] text-neutral-500 font-mono">admin@edumind.vn</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-purple-50 flex items-center gap-2 transition"
              >
                <User size={16} />
                <span>Cài đặt tài khoản</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
              >
                <SignOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
