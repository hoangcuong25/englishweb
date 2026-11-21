'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PedagogyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/personal-dev-assessments');
  }, [router]);

  return null;
}
