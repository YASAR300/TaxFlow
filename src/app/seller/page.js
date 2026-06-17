'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SellerForm from '@/components/forms/SellerForm';
import { DEFAULT_SELLER } from '@/constants/defaultValues';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';

export default function SellerProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sellerData, setSellerData] = useState(DEFAULT_SELLER);

  // Authenticate user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to access settings');
        router.push('/login');
      } else {
        setUser(user);
        // Fetch saved seller details
        try {
          const res = await fetch('/api/seller');
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setSellerData({
                businessName: data.business_name || '',
                ownerName: data.owner_name || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                stateCode: data.state_code || '',
                pinCode: data.pin_code || '',
                gstin: data.gstin || '',
                pan: data.pan || '',
                email: data.email || '',
                phone: data.phone || '',
                website: data.website || '',
                logoUrl: data.logo_url || null,
              });
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
      setLoadingUser(false);
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleSellerChange = (field, value) => {
    setSellerData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingUser) {
    return (
      <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
        <Sidebar user={{ email: 'loading...' }} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
            <div className="flex items-center gap-2 text-[13px] text-[#555]">
              <span>TaxFlow</span>
              <span>/</span>
              <span className="text-[#999]">Business Settings</span>
            </div>
          </div>

          {/* Scrollable Form Container with Skeletons */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="mb-6 flex flex-col gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3.5 w-96" />
              </div>
              
              {/* Form Skeleton */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-3.5 w-36" />
                  </div>
                  <Skeleton className="h-7 w-20 rounded-md" />
                </div>
                
                {/* Inputs Grid Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>

                {/* Logo Skeleton */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#2a2a2a]">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                </div>

                {/* Save Button Skeleton */}
                <div className="pt-4 border-t border-[#2a2a2a] flex justify-end">
                  <Skeleton className="h-9 w-36 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Business Settings</span>
          </div>
        </div>

        {/* Scrollable Form Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-[#e2e8f0]">Business Configuration</h1>
              <p className="text-xs text-[#555] mt-1">
                Configure your business billing info. These details will serve as your default seller profile for new invoices.
              </p>
            </div>
            
            <SellerForm 
              sellerData={sellerData}
              onChange={handleSellerChange}
              errors={{}}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
