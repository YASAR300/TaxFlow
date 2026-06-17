'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, CheckCircle2, XCircle, HelpCircle, Loader2 
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { validateGSTIN, validatePAN } from '@/utils/validators';
import { INDIAN_STATES } from '@/constants/indianStates';

export default function BuyerForm({ 
  buyerData = {}, 
  sellerState = '', 
  onChange, 
  errors = {} 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Local state for tax override
  const [override, setOverride] = useState(buyerData.taxModeOverride || false);
  const [manualTaxMode, setManualTaxMode] = useState(buyerData.taxMode || 'intrastate');

  const popoverRef = useRef(null);

  // Live GSTIN detection
  const gstinResult = buyerData.gstin ? validateGSTIN(buyerData.gstin) : null;
  const isGstinValid = gstinResult ? gstinResult.isValid : false;
  const detectedState = gstinResult ? gstinResult.stateName : null;

  // Live PAN detection
  const panResult = buyerData.pan ? validatePAN(buyerData.pan) : null;
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

  // Fetch clients for saved clients selector
  const fetchClients = async (search = '') => {
    setLoadingClients(true);
    try {
      const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  const togglePopover = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchClients(searchTerm);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchClients(val);
  };

  const handleSelectClient = (client) => {
    onChange('businessName', client.business_name || '');
    onChange('contactName', client.contact_name || '');
    onChange('address', client.address || '');
    onChange('city', client.city || '');
    onChange('state', client.state || '');
    onChange('stateCode', client.state_code || '');
    onChange('pinCode', client.pin_code || '');
    onChange('gstin', client.gstin || '');
    onChange('pan', client.pan || '');
    onChange('email', client.email || '');
    onChange('phone', client.phone || '');
    setIsOpen(false);
  };

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state and override selections
  useEffect(() => {
    let mode = 'intrastate';
    if (override) {
      mode = manualTaxMode;
    } else if (sellerState && buyerData.state) {
      const isSame = sellerState.trim().toLowerCase() === buyerData.state.trim().toLowerCase();
      mode = isSame ? 'intrastate' : 'interstate';
    } else {
      mode = 'intrastate';
    }

    if (buyerData.taxMode !== mode) {
      onChange('taxMode', mode);
    }
    if (buyerData.taxModeOverride !== override) {
      onChange('taxModeOverride', override);
    }
  }, [sellerState, buyerData.state, override, manualTaxMode, buyerData.taxMode, buyerData.taxModeOverride, onChange]);

  // Read value updates from props
  useEffect(() => {
    if (buyerData.taxModeOverride !== undefined && buyerData.taxModeOverride !== override) {
      setOverride(buyerData.taxModeOverride);
    }
    if (buyerData.taxMode !== undefined && buyerData.taxMode !== manualTaxMode) {
      setManualTaxMode(buyerData.taxMode);
    }
  }, [buyerData.taxModeOverride, buyerData.taxMode, override, manualTaxMode]);

  const handleToggleOverride = () => {
    const nextOverride = !override;
    setOverride(nextOverride);
  };

  const handleManualModeChange = (mode) => {
    setManualTaxMode(mode);
  };

  // Determine current active banner details
  const getBannerDetails = () => {
    let mode = 'intrastate';
    let isSame = false;
    const hasBothStates = !!(sellerState && buyerData.state);

    if (hasBothStates) {
      isSame = sellerState.trim().toLowerCase() === buyerData.state.trim().toLowerCase();
      mode = isSame ? 'intrastate' : 'interstate';
    }

    if (override) {
      const isManualIntra = manualTaxMode === 'intrastate';
      return {
        type: isManualIntra ? 'success' : 'info',
        text: isManualIntra 
          ? '✓ Intra-state Supply (Overridden) — CGST + SGST will apply' 
          : '✓ Inter-state Supply (Overridden) — IGST will apply',
        icon: CheckCircle2
      };
    }

    if (!hasBothStates) {
      return {
        type: 'gray',
        text: 'Fill both states to detect tax mode',
        icon: HelpCircle
      };
    }

    if (isSame) {
      return {
        type: 'success',
        text: '✓ Intra-state Supply — CGST + SGST will apply',
        icon: CheckCircle2
      };
    } else {
      return {
        type: 'info',
        text: '✓ Inter-state Supply — IGST will apply',
        icon: CheckCircle2
      };
    }
  };

  const banner = getBannerDetails();
  
  const bannerClasses = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    info: 'bg-[#5e6ad2]/10 border-[#5e6ad2]/20 text-[#7b87e8]',
    gray: 'bg-[#1a1a1a] border-[#2a2a2a] text-[#888]'
  };

  const BannerIcon = banner.icon;

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2]">
          <Users size={16} className="text-[#5e6ad2]" />
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            Client Details
          </h2>
        </div>
        
        {/* Select Saved Client Popover */}
        <div className="relative" ref={popoverRef}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={togglePopover}
            icon={Search}
            className="text-[#5e6ad2] hover:text-[#7b87e8] border-[#2a2a2a]"
          >
            Select Saved Client
          </Button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl p-3 z-50 flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchTerm} 
                onChange={handleSearchChange}
                className="w-full px-2.5 py-1.5 rounded bg-[#141414] border border-[#2a2a2a] text-xs text-[#e2e8f0] focus:outline-none focus:border-[#5e6ad2] placeholder-[#444]"
              />
              
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                {loadingClients ? (
                  <div className="flex flex-col gap-2 py-1">
                    <div className="p-1.5 border-b border-[#2a2a2a]/20 last:border-0 flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <div className="flex justify-between items-center mt-1">
                        <Skeleton className="h-2 w-20" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                    <div className="p-1.5 border-b border-[#2a2a2a]/20 last:border-0 flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <div className="flex justify-between items-center mt-1">
                        <Skeleton className="h-2 w-16" />
                        <Skeleton className="h-3 w-6" />
                      </div>
                    </div>
                    <div className="p-1.5 border-b border-[#2a2a2a]/20 last:border-0 flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <div className="flex justify-between items-center mt-1">
                        <Skeleton className="h-2 w-24" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-6 text-[11px] text-[#555]">
                    No clients found
                  </div>
                ) : (
                  clients.map(client => (
                    <div 
                      key={client.id} 
                      onClick={() => handleSelectClient(client)}
                      className="p-2 hover:bg-[#252525] rounded cursor-pointer transition-colors border-b border-[#2a2a2a]/30 last:border-0 text-left"
                    >
                      <p className="text-xs font-semibold text-[#e2e8f0] truncate">
                        {client.business_name}
                      </p>
                      <div className="flex justify-between items-center mt-0.5 text-[9px] text-[#555] font-mono">
                        <span>{client.gstin || 'NO GSTIN'}</span>
                        <span className="font-sans font-medium text-[#ccc] bg-[#252525] px-1 rounded">
                          {client.city || client.state || ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <Input 
          label="Business Name" 
          value={buyerData.businessName || ''} 
          onChange={(e) => onChange('businessName', e.target.value)}
          error={errors.businessName}
          required
          className="md:col-span-2"
          placeholder="Enter client's legal business name"
        />

        {/* Row 2 */}
        <Input 
          label="Owner/Contact Name" 
          value={buyerData.contactName || ''} 
          onChange={(e) => onChange('contactName', e.target.value)}
          error={errors.contactName}
          placeholder="Contact person name"
        />
        <Input 
          label="Email" 
          type="email"
          value={buyerData.email || ''} 
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
          placeholder="client@example.com"
        />

        {/* Row 3 */}
        <Input 
          label="Phone" 
          value={buyerData.phone || ''} 
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="10-digit mobile number"
        />
        <div className="relative">
          <Input 
            label="GSTIN" 
            value={buyerData.gstin || ''} 
            onChange={handleGSTINChange}
            error={errors.gstin}
            placeholder="15-digit GSTIN"
            maxLength={15}
            icon={
              buyerData.gstin && (
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

        {/* Row 4 */}
        <Input 
          label="PAN Number" 
          value={buyerData.pan || ''} 
          onChange={handlePANChange}
          error={errors.pan}
          placeholder="10-digit PAN"
          maxLength={10}
          icon={
            buyerData.pan && (
              isPanValid ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-rose-500" />
              )
            )
          }
        />
        <div className="hidden md:block" />

        {/* Row 5 */}
        <Input 
          label="Address" 
          type="textarea"
          rows={2}
          value={buyerData.address || ''} 
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
          className="md:col-span-2"
          placeholder="Billing address details"
        />

        {/* Row 6 */}
        <Input 
          label="City" 
          value={buyerData.city || ''} 
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
          placeholder="Billing city"
        />
        <Input 
          label="PIN Code" 
          value={buyerData.pinCode || ''} 
          onChange={(e) => onChange('pinCode', e.target.value)}
          error={errors.pinCode}
          placeholder="6-digit PIN code"
          maxLength={6}
        />

        {/* Row 7 */}
        <Select 
          label="State" 
          value={buyerData.state || ''} 
          onChange={handleStateChange}
          error={errors.state}
          options={stateOptions}
          placeholder="Select State"
          className="md:col-span-2"
        />
      </div>

      {/* Tax Mode Detection Banner */}
      <div className={`border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${bannerClasses[banner.type]}`}>
        <div className="flex items-center gap-2.5">
          <BannerIcon size={16} className="shrink-0" />
          <span className="text-[12px] font-medium leading-none">{banner.text}</span>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-current/10">
          {/* Override Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold opacity-60">Override</span>
            <button
              type="button"
              onClick={handleToggleOverride}
              className={`w-7 h-4 rounded-full transition-colors relative border ${
                override ? 'bg-[#5e6ad2] border-[#5e6ad2]' : 'bg-[#1a1a1a] border-[#2a2a2a]'
              }`}
            >
              <span 
                className={`block w-2.5 h-2.5 rounded-full bg-white transition-all absolute top-[2px] ${
                  override ? 'left-[13px]' : 'left-[2px]'
                }`}
              />
            </button>
          </div>

          {/* Manual Selector buttons */}
          {override && (
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#2a2a2a] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => handleManualModeChange('intrastate')}
                className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded font-semibold transition-all ${
                  manualTaxMode === 'intrastate'
                    ? 'bg-[#5e6ad2] text-white'
                    : 'text-[#555] hover:text-[#ccc]'
                }`}
              >
                Intra
              </button>
              <button
                type="button"
                onClick={() => handleManualModeChange('interstate')}
                className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded font-semibold transition-all ${
                  manualTaxMode === 'interstate'
                    ? 'bg-[#5e6ad2] text-white'
                    : 'text-[#555] hover:text-[#ccc]'
                }`}
              >
                Inter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
