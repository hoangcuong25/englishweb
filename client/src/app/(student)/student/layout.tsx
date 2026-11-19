'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import AppTopbar from '@/components/shared/app-topbar';
import StudentSidebar from '@/components/shared/student-sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If inside a live classroom session, render 100% immersive fullscreen (no sidebar, no topbar)
  const isInsideLiveRoom = pathname.startsWith('/student/classroom/') && pathname !== '/student/classroom';

  if (isInsideLiveRoom) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-950 select-none">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      <AppTopbar currentPortal="student" pageTitle="Cổng Học Viên" />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<aside className="hidden lg:flex w-64 bg-white border-r border-line flex-col h-full shrink-0" />}>
          <StudentSidebar />
        </Suspense>
        <main className="flex-1 min-h-0 h-full overflow-y-auto p-4 sm:p-6 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

