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
  // Default to open on desktop
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Restore saved desktop sidebar preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_open');
      if (saved !== null) {
        setIsOpen(saved === 'true');
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  const openSidebar = () => {
    setIsOpen(true);
    try {
      localStorage.setItem('sidebar_open', 'true');
    } catch {}
  };

  const closeSidebar = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('sidebar_open', 'false');
    } catch {}
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
