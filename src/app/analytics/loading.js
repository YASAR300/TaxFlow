import Sidebar from '@/components/Sidebar';

export default function AnalyticsLoading() {
  const mockUser = { email: 'developer@example.com' };
  
  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={mockUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="h-4 bg-[#222] rounded w-28 animate-pulse"></div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
            
            {/* Page Title Skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-6 bg-[#222] rounded w-64 animate-pulse"></div>
              <div className="h-3.5 bg-[#222] rounded w-96 animate-pulse"></div>
            </div>

            {/* Top Stat Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between animate-pulse">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3.5 bg-[#222] rounded w-24"></div>
                    <div className="h-6 bg-[#222] rounded w-32"></div>
                    <div className="h-3 bg-[#222] rounded w-20"></div>
                  </div>
                  <div className="w-8 h-8 rounded bg-[#222]"></div>
                </div>
              ))}
            </div>

            {/* Split GST Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 flex flex-col items-center gap-2 animate-pulse">
                  <div className="h-3.5 bg-[#222] rounded w-28"></div>
                  <div className="h-5 bg-[#222] rounded w-36"></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* GST Slab Table Skeleton */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden animate-pulse">
                <div className="px-4 py-3 border-b border-[#1e1e1e] h-10 bg-[#141414]"></div>
                <div className="p-4 flex flex-col gap-4">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="h-4 bg-[#222] rounded w-16"></div>
                      <div className="h-4 bg-[#222] rounded w-12"></div>
                      <div className="h-4 bg-[#222] rounded w-24"></div>
                      <div className="h-4 bg-[#222] rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trend Skeleton */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden animate-pulse">
                <div className="px-4 py-3 border-b border-[#1e1e1e] h-10 bg-[#141414]"></div>
                <div className="p-4 flex flex-col gap-4">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-[#222] rounded w-16"></div>
                        <div className="h-4 bg-[#222] rounded w-36"></div>
                      </div>
                      <div className="w-full bg-[#1c1c1c] h-2 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
