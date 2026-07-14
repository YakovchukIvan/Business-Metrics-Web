import { Suspense } from 'react';
import { HomeClient } from '@/components/analysis/home-client';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-gray-400 text-sm">Loading auditor...</p>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
