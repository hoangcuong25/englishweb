'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global event bus for standalone toast calls
let globalAddToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const toast = {
  success: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'success', duration);
    else console.log('[Toast Success]', message);
  },
  error: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'error', duration);
    else console.error('[Toast Error]', message);
  },
  info: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'info', duration);
    else console.info('[Toast Info]', message);
  },
  warning: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'warning', duration);
    else console.warn('[Toast Warning]', message);
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-4 sm:right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-sm">
        {toasts.map((t) => {
          const typeStyles = {
            success: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100',
            error: 'bg-rose-900/90 border-rose-500/40 text-rose-100',
            warning: 'bg-amber-900/90 border-amber-500/40 text-amber-100',
            info: 'bg-sky-900/90 border-sky-500/40 text-sky-100',
          }[t.type];

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${typeStyles}`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium leading-relaxed">{t.message}</div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast,
      addToast: (message: string, type?: ToastType) => toast[type || 'info'](message),
      removeToast: () => {},
    };
  }
  return {
    toast,
    addToast: context.addToast,
    removeToast: context.removeToast,
  };
}
