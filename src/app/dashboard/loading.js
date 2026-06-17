'use client';

import Sidebar from '@/components/Sidebar';
import Skeleton from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      {/* Sidebar Placeholder */}
      <Sidebar user={{ email: 'loading...' }} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar header */}
        <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Dashboard</span>
          </div>
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>

        {/* Scrollable Dashboard Skeletons */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            
            {/* Header info */}
            <div className="mb-6 flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3.5 w-48" />
            </div>

            {/* Stat Cards Grid Skeletons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 flex flex-col gap-2.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>

            {/* Activity Block Skeleton */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              
              <div className="px-4 py-2 flex flex-col gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-[#1e1e1e] last:border-0 -mx-4 px-4">
                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <Skeleton className="h-3.5 w-48" />
                      <Skeleton className="h-3 w-72" />
                    </div>
                    <Skeleton className="w-12 h-3.5 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Blank state placeholder skeleton */}
              <div className="border-t border-[#1e1e1e] px-4 py-8 text-center flex flex-col items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-3.5 w-24 mt-1" />
                <Skeleton className="h-7 w-36 mt-1 rounded-md" />
              </div>
            </div>

            {/* Quick Actions Grid Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-4 flex flex-col gap-2.5">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3.5 w-36" />
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
