"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency, Currency } from "@/lib/currency-context";
import { DollarSign, ChevronDown, Check, Coins } from "lucide-react";

interface CurrencySwitcherProps {
  variant?: "pill" | "dropdown" | "button";
  className?: string;
  showRateHint?: boolean;
}

export default function CurrencySwitcher({
  variant = "dropdown",
  className = "",
  showRateHint = false,
}: CurrencySwitcherProps) {
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currencies: { code: Currency; symbol: string; label: string; flag: string; hint: string }[] = [
    {
      code: "VND",
      symbol: "₫",
      label: "VND",
      flag: "🇻🇳",
      hint: "Việt Nam Đồng (₫)",
    },
    {
      code: "USD",
      symbol: "$",
      label: "USD",
      flag: "🇺🇸",
      hint: "US Dollar ($)",
    },
  ];

  const currentOption = currencies.find((c) => c.code === currency) || currencies[0];

  if (variant === "pill") {
    return (
      <div className={`inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 ${className}`}>
        <button
          type="button"
          onClick={() => setCurrency("VND")}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            currency === "VND"
              ? "bg-white text-sky-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="Việt Nam Đồng (₫)"
        >
          <span>🇻🇳</span>
          <span>VND (₫)</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            currency === "USD"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="Đô la Mỹ ($ USD)"
        >
          <span>🇺🇸</span>
          <span>USD ($)</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-line hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
        title={`Chuyển đổi tiền tệ hiển thị (Đang chọn: ${currentOption.label})`}
        aria-label="Currency Switcher"
      >
        <span className="text-sm shrink-0">{currentOption.flag}</span>
        <span className="font-extrabold text-slate-800 tracking-tight text-[11px] sm:text-xs">
          {currentOption.label} ({currentOption.symbol})
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-line py-1.5 z-50 animate-in fade-in-50 duration-150 overflow-hidden">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Chọn tiền tệ
            </span>
            <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              1$ ≈ {(exchangeRate).toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className="p-1 space-y-0.5">
            {currencies.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs flex items-center justify-between rounded-xl transition cursor-pointer ${
                    isSelected
                      ? "font-extrabold text-sky-700 bg-sky-50/80"
                      : "text-slate-700 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <div>
                      <div className="font-extrabold text-slate-900 flex items-center gap-1">
                        <span>{c.code}</span>
                        <span className="text-slate-400 font-normal">({c.symbol})</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{c.hint}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {showRateHint && (
            <div className="mt-1 px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center font-medium">
              Tỷ giá quy đổi tự động cho khách quốc tế
            </div>
          )}
        </div>
      )}
    </div>
  );
}
