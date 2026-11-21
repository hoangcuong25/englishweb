"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Currency = "VND" | "USD";

// Tỷ giá tham chiếu chuẩn hiện hành (1 USD ≈ 25.400 VND)
export const DEFAULT_EXCHANGE_RATE = 25400;

interface FormatPriceOptions {
  showBoth?: boolean;
  targetCurrency?: Currency;
  freeLabel?: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  convertToUsd: (vndAmount: number) => number;
  convertToVnd: (usdAmount: number) => number;
  formatVnd: (vndAmount: number) => string;
  formatUsd: (usdAmount: number) => string;
  formatPrice: (vndAmount: number | null | undefined, options?: FormatPriceOptions) => string;
  getDualPrice: (vndAmount: number | null | undefined) => {
    primary: string;
    secondary: string;
    usdNumber: number;
    vndNumber: number;
    isFree: boolean;
  };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = "teacher_dong_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("VND");
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
      if (saved === "VND" || saved === "USD") {
        setCurrencyState(saved);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "VND" ? "USD" : "VND");
  };

  const convertToUsd = (vndAmount: number): number => {
    if (!vndAmount || isNaN(vndAmount) || vndAmount <= 0) return 0;
    return Math.round((vndAmount / exchangeRate) * 100) / 100;
  };

  const convertToVnd = (usdAmount: number): number => {
    if (!usdAmount || isNaN(usdAmount) || usdAmount <= 0) return 0;
    return Math.round(usdAmount * exchangeRate);
  };

  const formatVnd = (vndAmount: number): string => {
    if (!vndAmount || vndAmount <= 0) return "0 ₫";
    return `${Number(vndAmount).toLocaleString("vi-VN")} ₫`;
  };

  const formatUsd = (usdAmount: number): string => {
    if (!usdAmount || usdAmount <= 0) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdAmount);
  };

  const formatPrice = (
    vndAmount: number | null | undefined,
    options?: FormatPriceOptions
  ): string => {
    const rawVnd = Number(vndAmount || 0);
    const freeText = options?.freeLabel || "Miễn phí";

    if (rawVnd <= 0) {
      return freeText;
    }

    const activeCurr = options?.targetCurrency || currency;
    const usdVal = convertToUsd(rawVnd);

    if (activeCurr === "USD") {
      const usdStr = formatUsd(usdVal);
      if (options?.showBoth) {
        return `${usdStr} (~${formatVnd(rawVnd)})`;
      }
      return usdStr;
    }

    // Default VND
    const vndStr = formatVnd(rawVnd);
    if (options?.showBoth) {
      return `${vndStr} (~${formatUsd(usdVal)})`;
    }
    return vndStr;
  };

  const getDualPrice = (vndAmount: number | null | undefined) => {
    const rawVnd = Number(vndAmount || 0);
    const isFree = rawVnd <= 0;
    const usdVal = convertToUsd(rawVnd);

    if (isFree) {
      return {
        primary: "Miễn phí",
        secondary: "Free",
        usdNumber: 0,
        vndNumber: 0,
        isFree: true,
      };
    }

    if (currency === "USD") {
      return {
        primary: formatUsd(usdVal),
        secondary: formatVnd(rawVnd),
        usdNumber: usdVal,
        vndNumber: rawVnd,
        isFree: false,
      };
    }

    return {
      primary: formatVnd(rawVnd),
      secondary: formatUsd(usdVal),
      usdNumber: usdVal,
      vndNumber: rawVnd,
      isFree: false,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        setExchangeRate,
        convertToUsd,
        convertToVnd,
        formatVnd,
        formatUsd,
        formatPrice,
        getDualPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
