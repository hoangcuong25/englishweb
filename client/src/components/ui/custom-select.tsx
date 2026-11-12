'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  colorDot?: string; // Tailwind color e.g. 'bg-emerald-500', 'bg-amber-500'
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Chọn một mục...',
  label,
  disabled = false,
  searchable = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all duration-150 flex items-center justify-between gap-2 shadow-xs ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-primary ring-2 ring-sky-500/15 text-slate-900 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          {selectedOption ? (
            <>
              {selectedOption.colorDot && (
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedOption.colorDot}`} />
              )}
              {selectedOption.icon && (
                <span className="shrink-0 text-slate-500">{selectedOption.icon}</span>
              )}
              <span className="truncate font-semibold">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    selectedOption.badgeColor || 'bg-sky-100 text-primary'
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 py-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Search box if searchable */}
          {searchable && (
            <div className="px-2.5 pb-2 pt-1 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/70 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto px-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-sky-50 font-bold text-primary'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {option.colorDot && (
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${option.colorDot}`} />
                      )}
                      {option.icon && (
                        <span className={`shrink-0 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                          {option.icon}
                        </span>
                      )}
                      <div className="truncate">
                        <span className="block truncate">{option.label}</span>
                        {option.sublabel && (
                          <span className="block text-[11px] font-normal text-slate-400 truncate">
                            {option.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {option.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            option.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

