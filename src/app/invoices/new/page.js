'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewInvoicePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e6ad2] border-t-transparent"></div>
    </div>
  );
}
