'use client';

import React from 'react';
import AppTopbar from '@/components/shared/app-topbar';
import StudentSidebar from '@/components/shared/student-sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppTopbar currentPortal="student" pageTitle="Cổng Học Viên" />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

