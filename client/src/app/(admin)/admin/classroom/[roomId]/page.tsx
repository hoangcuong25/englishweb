'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ClassroomContainer } from '@/components/classroom/classroom-container';

export default function AdminClassroomPage() {
  const params = useParams();
  const roomId = (params?.roomId as string) || 'ielts-masterclass-room';

  return <ClassroomContainer roomId={roomId} isHost={true} />;
}
