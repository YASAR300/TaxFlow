'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SellerForm from '@/components/forms/SellerForm';
import BuyerForm from '@/components/forms/BuyerForm';
import InvoiceMetaForm from '@/components/forms/InvoiceMetaForm';
import { DEFAULT_SELLER, DEFAULT_BUYER, DEFAULT_INVOICE_META } from '@/constants/defaultValues';
import Button from '@/components/ui/Button';

export default function TestFormsPage() {
  const [sellerData, setSellerData] = useState(DEFAULT_SELLER);
  const [buyerData, setBuyerData] = useState(DEFAULT_BUYER);
  const [metaData, setMetaData] = useState(DEFAULT_INVOICE_META());

  const [sellerErrors, setSellerErrors] = useState({});
  const [buyerErrors, setBuyerErrors] = useState({});

  const handleSellerChange = (field, value) => {
    setSellerData(prev => ({ ...prev, [field]: value }));
    // Simple clear error on change
    if (sellerErrors[field]) {
      setSellerErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBuyerChange = (field, value) => {
    setBuyerData(prev => ({ ...prev, [field]: value }));
    if (buyerErrors[field]) {
      setBuyerErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMetaChange = (field, value) => {
    setMetaData(prev => ({ ...prev, [field]: value }));
  };

  const triggerSellerMockErrors = () => {
    setSellerErrors({
      businessName: 'Business Name is required!',
      gstin: 'Invalid GSTIN format structure!',
      email: 'Email address domain format is incorrect!'
    });
  };

  const clearSellerMockErrors = () => {
    setSellerErrors({});
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={{ email: 'test@taxflow.in' }} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Forms Sandbox</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            Development Mode
          </span>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Forms section (2 Cols) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0]">Forms Playground</h1>
                <p className="text-xs text-[#555] mt-1">
                  Test live validations, logo upload, API loaders, and banners.
                </p>
              </div>

              {/* Seller Details Form */}
              <SellerForm 
                sellerData={sellerData}
                onChange={handleSellerChange}
                errors={sellerErrors}
              />

              {/* Buyer Details Form */}
              <BuyerForm 
                buyerData={buyerData}
                sellerState={sellerData.state}
                onChange={handleBuyerChange}
                errors={buyerErrors}
              />

              {/* Invoice Meta Form */}
              <InvoiceMetaForm 
                metaData={metaData}
                onChange={handleMetaChange}
              />
            </div>

            {/* State Inspector section (1 Col) */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-0 h-fit">
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider pl-2 border-l-2 border-[#5e6ad2] mb-4">
                  Sandbox Controls
                </h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={triggerSellerMockErrors}>
                    Simulate Validation Errors
                  </Button>
                  <Button variant="secondary" size="sm" onClick={clearSellerMockErrors}>
                    Clear Errors
                  </Button>
                </div>
              </div>

              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 shadow-sm flex-1 font-mono text-[10px] max-h-[600px] overflow-y-auto custom-scrollbar">
                <h3 className="text-xs font-sans font-semibold text-[#888] uppercase tracking-wider pl-2 border-l-2 border-[#5e6ad2] mb-4">
                  React State Inspector
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[#5e6ad2] font-semibold block mb-1">sellerData:</span>
                    <pre className="bg-[#161616] p-2.5 rounded border border-[#2a2a2a] overflow-x-auto text-[#aaa]">
                      {JSON.stringify(
                        { ...sellerData, logoUrl: sellerData.logoUrl ? 'base64_string_present_...' : null }, 
                        null, 
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold block mb-1">buyerData:</span>
                    <pre className="bg-[#161616] p-2.5 rounded border border-[#2a2a2a] overflow-x-auto text-[#aaa]">
                      {JSON.stringify(buyerData, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-amber-500 font-semibold block mb-1">metaData:</span>
                    <pre className="bg-[#161616] p-2.5 rounded border border-[#2a2a2a] overflow-x-auto text-[#aaa]">
                      {JSON.stringify(metaData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
