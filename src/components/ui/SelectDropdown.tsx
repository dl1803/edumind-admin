'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectDropdownProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  prefix?: React.ReactNode;
  fullWidth?: boolean;
  error?: boolean;
  title?: string;
  placement?: 'bottom' | 'top';
}

export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = 'Chọn một mục...',
  disabled = false,
  className = '',
  dropdownClassName = '',
  size = 'md',
  prefix,
  fullWidth = false,
  error = false,
  title,
  placement = 'bottom',
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;

  const sizeClasses =
    size === 'sm'
      ? 'py-1 px-2.5 text-xs'
      : size === 'lg'
      ? 'py-2.5 px-3.5 text-xs'
      : 'py-2 px-3 text-xs';

  const borderClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : 'border-neutral-200 hover:border-purple-300 focus:border-purple-600 focus:ring-purple-500/20';

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${fullWidth ? 'w-full block' : 'inline-block text-left'}`}
    >
      {/* Hidden native select for standard accessibility and form testing */}
      <select
        tabIndex={-1}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title={title}
        className="sr-only"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-neutral-50 hover:bg-white border focus:outline-none focus:ring-2 rounded-xl font-medium text-neutral-800 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${borderClasses} ${sizeClasses} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5 truncate text-left">
          {prefix && <span className="text-neutral-500 shrink-0">{prefix}</span>}
          <span className={`truncate ${isPlaceholder ? 'text-neutral-400 font-normal' : ''}`}>
            {displayLabel}
          </span>
        </span>
        <CaretDown
          size={size === 'sm' ? 12 : 14}
          weight="bold"
          className={`text-neutral-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-purple-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 z-50 ${
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } max-h-60 overflow-y-auto rounded-xl bg-white border border-purple-100 shadow-lg shadow-purple-950/10 p-1.5 custom-scrollbar focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${
            fullWidth ? 'w-full min-w-full' : (size === 'sm' ? 'min-w-[80px]' : 'min-w-[160px]') + ' w-max max-w-[340px]'
          } ${dropdownClassName}`}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);

            return (
              <div
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(String(option.value));
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-neutral-700 hover:bg-purple-50/80 hover:text-purple-700'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check size={13} weight="bold" className="text-purple-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
