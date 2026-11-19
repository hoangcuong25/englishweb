'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, LucideIcon } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon | null;
  error?: string;
  containerClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ icon = Lock, error, containerClassName = '', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const IconComponent = icon;

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        <div className="relative">
          {IconComponent !== null && (
            <IconComponent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full ${
              IconComponent !== null ? 'pl-10' : 'pl-3.5'
            } pr-10 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-line focus:border-primary'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-500 hover:text-slate-700" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            )}
          </button>
        </div>
        {error && <p className="text-[11px] text-red-500 pl-1">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
