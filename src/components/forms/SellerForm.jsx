'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Building2, Database, Save, Camera, X, CheckCircle2, XCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { validateGSTIN, validatePAN } from '@/utils/validators';
import { INDIAN_STATES } from '@/constants/indianStates';

export default function SellerForm({ sellerData = {}, onChange, errors = {} }) {
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-load Seller details on mount if businessName is not yet set
  useEffect(() => {
    const autoLoadSeller = async () => {
      try {
        const res = await fetch('/api/seller');
        if (res.ok) {
          const data = await res.json();
          if (data && !sellerData.businessName) {
            onChange('businessName', data.business_name || '');
            onChange('ownerName', data.owner_name || '');
            onChange('address', data.address || '');
            onChange('city', data.city || '');
            onChange('state', data.state || '');
            onChange('stateCode', data.state_code || '');
            onChange('pinCode', data.pin_code || '');
            onChange('gstin', data.gstin || '');
            onChange('pan', data.pan || '');
            onChange('email', data.email || '');
            onChange('phone', data.phone || '');
            onChange('website', data.website || '');
            onChange('logoUrl', data.logo_url || null);
            toast.success('Business details loaded');
          }
        }
      } catch (err) {
        console.error('Failed to auto-load seller details:', err);
      }
    };
    autoLoadSeller();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live GSTIN detection
  const gstinResult = sellerData.gstin ? validateGSTIN(sellerData.gstin) : null;
  const isGstinValid = gstinResult ? gstinResult.isValid : false;
  const detectedState = gstinResult ? gstinResult.stateName : null;

  // Live PAN detection
  const panResult = sellerData.pan ? validatePAN(sellerData.pan) : null;
  const isPanValid = panResult ? panResult.isValid : false;

  // State Options
  const stateOptions = INDIAN_STATES.map(state => ({
    value: state.name,
    label: `${state.name} (${state.gstCode})`
  }));

  const handleGSTINChange = (e) => {
    const val = e.target.value.toUpperCase();
    onChange('gstin', val);
    
    // Auto-detect and set state & stateCode from GSTIN if valid
    const result = validateGSTIN(val);
    if (result.isValid && result.stateName && result.stateCode) {
      onChange('state', result.stateName);
      onChange('stateCode', result.stateCode);
    }
  };

  const handlePANChange = (e) => {
    const val = e.target.value.toUpperCase();
    onChange('pan', val);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    onChange('state', stateName);
    const stateObj = INDIAN_STATES.find(s => s.name === stateName);
    if (stateObj) {
      onChange('stateCode', stateObj.gstCode);
    } else {
      onChange('stateCode', '');
    }
  };

  // Logo upload processing
  const processFile = (file) => {
    if (!file) return;
    
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Only PNG, JPEG, and WEBP formats are supported');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange('logoUrl', reader.result);
      toast.success('Logo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();
    onChange('logoUrl', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // API Integration: Load Saved Details
  const handleLoadSaved = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/seller');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          onChange('businessName', data.business_name || '');
          onChange('ownerName', data.owner_name || '');
          onChange('address', data.address || '');
          onChange('city', data.city || '');
          onChange('state', data.state || '');
          onChange('stateCode', data.state_code || '');
          onChange('pinCode', data.pin_code || '');
          onChange('gstin', data.gstin || '');
          onChange('pan', data.pan || '');
          onChange('email', data.email || '');
          onChange('phone', data.phone || '');
          onChange('website', data.website || '');
          onChange('logoUrl', data.logo_url || null);
          toast.success('Business details loaded successfully!');
        } else {
          toast.error('No default business details found');
        }
      } else {
        toast.error('Failed to load saved details');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading saved details');
    } finally {
      setLoadingSaved(false);
    }
  };

  // API Integration: Save Details
  const handleSaveDetails = async () => {
    if (!sellerData.businessName) {
      toast.error('Business Name is required to save');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        business_name: sellerData.businessName || '',
        owner_name: sellerData.ownerName || '',
        address: sellerData.address || '',
        city: sellerData.city || '',
        state: sellerData.state || '',
        state_code: sellerData.stateCode || '',
        pin_code: sellerData.pinCode || '',
        gstin: sellerData.gstin || '',
        pan: sellerData.pan || '',
        email: sellerData.email || '',
        phone: sellerData.phone || '',
        website: sellerData.website || '',
        logo_url: sellerData.logoUrl || null,
      };

      const res = await fetch('/api/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Business details saved!');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to save details');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving business details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2]">
          <Building2 size={16} className="text-[#5e6ad2]" />
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            Your Business Details
          </h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLoadSaved}
          loading={loadingSaved}
          icon={Database}
          className="text-[#5e6ad2] hover:text-[#7b87e8] border-[#2a2a2a]"
        >
          Load Saved
        </Button>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <Input 
          label="Business Name" 
          value={sellerData.businessName || ''} 
          onChange={(e) => onChange('businessName', e.target.value)}
          error={errors.businessName}
          required
          className="md:col-span-2"
          placeholder="Enter legal business name"
        />

        {/* Row 2 */}
        <Input 
          label="Owner/Contact Name" 
          value={sellerData.ownerName || ''} 
          onChange={(e) => onChange('ownerName', e.target.value)}
          error={errors.ownerName}
          placeholder="Owner or contact person"
        />
        <Input 
          label="Email" 
          type="email"
          value={sellerData.email || ''} 
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
          placeholder="business@example.com"
        />

        {/* Row 3 */}
        <Input 
          label="Phone" 
          value={sellerData.phone || ''} 
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="10-digit mobile number"
        />
        <Input 
          label="Website" 
          value={sellerData.website || ''} 
          onChange={(e) => onChange('website', e.target.value)}
          error={errors.website}
          placeholder="https://example.com"
        />

        {/* Row 4 */}
        <div className="relative">
          <Input 
            label="GSTIN" 
            value={sellerData.gstin || ''} 
            onChange={handleGSTINChange}
            error={errors.gstin}
            placeholder="15-digit GSTIN (e.g. 27AAPCR1206M1Z8)"
            maxLength={15}
            icon={
              sellerData.gstin && (
                isGstinValid ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-rose-500" />
                )
              )
            }
          />
          {detectedState && (
            <span className="absolute right-0 top-0 text-[10px] bg-[#252525] text-[#ccc] border border-[#2a2a2a] px-1.5 py-0.5 rounded leading-none font-medium">
              {detectedState}
            </span>
          )}
        </div>

        {/* Row 5 */}
        <Input 
          label="PAN Number" 
          value={sellerData.pan || ''} 
          onChange={handlePANChange}
          error={errors.pan}
          placeholder="10-digit PAN (e.g. ABCDE1234F)"
          maxLength={10}
          icon={
            sellerData.pan && (
              isPanValid ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-rose-500" />
              )
            )
          }
        />

        {/* Row 6 */}
        <Input 
          label="Address" 
          type="textarea"
          rows={2}
          value={sellerData.address || ''} 
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
          className="md:col-span-2"
          placeholder="Street address, building name, area"
        />

        {/* Row 7 */}
        <Input 
          label="City" 
          value={sellerData.city || ''} 
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
          placeholder="City name"
        />
        <Input 
          label="PIN Code" 
          value={sellerData.pinCode || ''} 
          onChange={(e) => onChange('pinCode', e.target.value)}
          error={errors.pinCode}
          placeholder="6-digit PIN code"
          maxLength={6}
        />

        {/* Row 8 */}
        <Select 
          label="State" 
          value={sellerData.state || ''} 
          onChange={handleStateChange}
          error={errors.state}
          options={stateOptions}
          placeholder="Select Indian State"
          className="md:col-span-2"
        />
      </div>

      {/* Logo Upload Section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#2a2a2a]">
        <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">
          Business Logo
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border border-dashed border-[#2a2a2a] hover:border-[#333] rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#141414] hover:bg-[#181818] transition-all relative min-h-[120px]"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
          {sellerData.logoUrl ? (
            <div className="relative group w-20 h-20 border border-[#2a2a2a] bg-[#1a1a1a] rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={sellerData.logoUrl} 
                alt="Business logo preview" 
                className="w-full h-full object-contain"
              />
              <button 
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-0 right-0 p-1 bg-black/60 hover:bg-black/90 text-white rounded-bl border-l border-b border-[#2a2a2a] transition-all"
                title="Remove logo"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              <Camera size={24} className="text-[#555]" />
              <div className="text-center">
                <p className="text-[12px] text-[#888] font-medium">Click to upload logo or drag & drop</p>
                <p className="text-[10px] text-[#444] mt-0.5">PNG, JPG, or WEBP (Max 2MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-[#2a2a2a] flex justify-end">
        <Button 
          variant="primary" 
          size="md" 
          onClick={handleSaveDetails}
          loading={loading}
          icon={Save}
          className="shadow-[0_4px_12px_rgba(94,106,210,0.15)]"
        >
          Save Business Details
        </Button>
      </div>
    </div>
  );
}
