'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Read initial preference synchronously to avoid layout flicker (CLS)
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebar_open');
        if (saved !== null) return saved === 'true';
        const match = document.cookie.match(/sidebar_open=(true|false)/);
        if (match) return match[1] === 'true';
      } catch {}
    }
    return true;
  });
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const saveState = (next: boolean) => {
    try {
      localStorage.setItem('sidebar_open', String(next));
      document.cookie = `sidebar_open=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      saveState(next);
      return next;
    });
  };

  const openSidebar = () => {
    setIsOpen(true);
    saveState(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    saveState(false);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        isMobileDrawerOpen,
        setMobileDrawerOpen,
        toggleMobileDrawer,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isOpen: true,
      toggleSidebar: () => {},
      openSidebar: () => {},
      closeSidebar: () => {},
      isMobileDrawerOpen: false,
      setMobileDrawerOpen: () => {},
      toggleMobileDrawer: () => {},
    };
  }
  return context;
}
