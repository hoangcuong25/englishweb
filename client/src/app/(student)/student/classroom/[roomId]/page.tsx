'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ClassroomContainer = dynamic(
  () => import('@/components/classroom/classroom-container').then((m) => m.ClassroomContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <p className="text-sm font-medium">Đang tải phòng học trực tuyến...</p>
        </div>
      </div>
    ),
  },
);

export default function StudentClassroomPage() {
  const params = useParams();
  const roomId = (params?.roomId as string) || 'ielts-masterclass-room';

  return <ClassroomContainer roomId={roomId} isHost={false} />;
}
