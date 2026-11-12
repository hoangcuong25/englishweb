'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  className?: string;
  triggerClassName?: string;
  align?: 'left' | 'right';
}

export default function ActionMenu({
  items,
  className = '',
  triggerClassName = '',
  align = 'right',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition duration-150 cursor-pointer ${
          isOpen ? 'bg-slate-100 text-slate-800' : ''
        } ${triggerClassName}`}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-52 py-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-1.5 space-y-0.5">
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-colors flex items-center space-x-2.5 ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon && (
                  <span
                    className={`shrink-0 ${
                      item.variant === 'danger' ? 'text-red-500' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

