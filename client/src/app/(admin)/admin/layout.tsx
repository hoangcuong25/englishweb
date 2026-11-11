'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AppTopbar from '@/components/shared/app-topbar';
import AdminSidebar from '@/components/shared/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If inside a live classroom session, render 100% immersive fullscreen (no sidebar, no topbar)
  const isInsideLiveRoom = pathname.startsWith('/admin/classroom/') && pathname !== '/admin/classroom';

  if (isInsideLiveRoom) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-950 select-none">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppTopbar currentPortal="admin" pageTitle="Cổng Quản Trị & Giảng Viên" />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

