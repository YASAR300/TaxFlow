'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Users, Search, Plus, Edit2, Trash2, X, CheckCircle2, 
  XCircle, Loader2, ArrowUpRight, DollarSign, FileText, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { validateGSTIN, validatePAN } from '@/utils/validators';
import { INDIAN_STATES } from '@/constants/indianStates';

const DEFAULT_CLIENT_FORM = {
  id: '',
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  gstin: '',
  pan: '',
  address: '',
  city: '',
  pinCode: '',
  state: '',
  stateCode: '',
};

export default function ClientsPage() {
  const mockUser = { email: 'developer@example.com' };

  // List States
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState(DEFAULT_CLIENT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalClients: 0, totalBilled: 0, avgBilled: 0 });

  const stateOptions = INDIAN_STATES.map(state => ({
    value: state.name,
    label: `${state.name} (${state.gstCode})`
  }));

  const fetchClients = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : '/api/clients';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClients(data || []);
        
        // Compute stats
        const count = data.length;
        const total = data.reduce((sum, c) => sum + (parseFloat(c.total_invoiced) || 0), 0);
        const avg = count > 0 ? total / count : 0;
        setStats({ totalClients: count, totalBilled: total, avgBilled: avg });
      } else {
        toast.error('Failed to fetch clients');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClients();
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Form Field change handler
  const handleFieldChange = (field, value) => {
    setClientForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGSTINChange = (e) => {
    const val = e.target.value.toUpperCase();
    handleFieldChange('gstin', val);
    
    // Auto-detect and set state & stateCode from GSTIN if valid
    const result = validateGSTIN(val);
    if (result.isValid && result.stateName && result.stateCode) {
      handleFieldChange('state', result.stateName);
      handleFieldChange('stateCode', result.stateCode);
    }
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    handleFieldChange('state', stateName);
    const stateObj = INDIAN_STATES.find(s => s.name === stateName);
    if (stateObj) {
      handleFieldChange('stateCode', stateObj.gstCode);
    } else {
      handleFieldChange('stateCode', '');
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!clientForm.businessName) errs.businessName = 'Business Name is required';
    
    if (clientForm.gstin) {
      const gstinResult = validateGSTIN(clientForm.gstin);
      if (!gstinResult.isValid) errs.gstin = 'Invalid GSTIN number format';
    }
    if (clientForm.pan) {
      const panResult = validatePAN(clientForm.pan);
      if (!panResult.isValid) errs.pan = 'Invalid PAN format';
    }
    
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const savingToast = toast.loading(clientForm.id ? 'Updating client...' : 'Saving client...');

    try {
      const payload = {
        id: clientForm.id || undefined,
        business_name: clientForm.businessName,
        contact_name: clientForm.contactName || null,
        address: clientForm.address || null,
        city: clientForm.city || null,
        state: clientForm.state || null,
        state_code: clientForm.stateCode || null,
        pin_code: clientForm.pinCode || null,
        gstin: clientForm.gstin || null,
        pan: clientForm.pan || null,
        email: clientForm.email || null,
        phone: clientForm.phone || null,
      };

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(clientForm.id ? 'Client updated' : 'Client saved successfully', { id: savingToast });
        setModalOpen(false);
        setClientForm(DEFAULT_CLIENT_FORM);
        fetchClients();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save client', { id: savingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving client info', { id: savingToast });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setClientForm(DEFAULT_CLIENT_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setClientForm({
      id: c.id,
      businessName: c.business_name || '',
      contactName: c.contact_name || '',
      email: c.email || '',
      phone: c.phone || '',
      gstin: c.gstin || '',
      pan: c.pan || '',
      address: c.address || '',
      city: c.city || '',
      pinCode: c.pin_code || '',
      state: c.state || '',
      stateCode: c.state_code || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Live indicators
  const gstinResult = clientForm.gstin ? validateGSTIN(clientForm.gstin) : null;
  const isGstinValid = gstinResult ? gstinResult.isValid : false;
  const panResult = clientForm.pan ? validatePAN(clientForm.pan) : null;
  const isPanValid = panResult ? panResult.isValid : false;

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={mockUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Clients</span>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleOpenAddModal}
            icon={Plus}
          >
            Add Client
          </Button>
        </header>

        {/* Page Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            
            {/* Header Description */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-[#e2e8f0]">Clients Database</h1>
              <p className="text-xs text-[#555] mt-1">
                View registered client profiles, GSTIN details, and billing history.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Users size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-[#555] uppercase font-bold tracking-wider">Total Clients</p>
                  {loading ? (
                    <div className="h-5 bg-[#222] rounded w-12 mt-1 animate-pulse" />
                  ) : (
                    <p className="text-lg font-bold text-[#ccc]">{stats.totalClients}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-[#555] uppercase font-bold tracking-wider">Total Billed</p>
                  {loading ? (
                    <div className="h-5 bg-[#222] rounded w-28 mt-1 animate-pulse" />
                  ) : (
                    <p className="text-lg font-bold text-emerald-400">₹{(stats.totalBilled || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  )}
                </div>
              </div>

              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <FileText size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-[#555] uppercase font-bold tracking-wider">Avg Billing / Client</p>
                  {loading ? (
                    <div className="h-5 bg-[#222] rounded. w-24 mt-1 animate-pulse" />
                  ) : (
                    <p className="text-lg font-bold text-orange-400">₹{(stats.avgBilled || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Search Input Filter */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-3 mb-4 flex gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-2.5 text-[#555]" />
                <input 
                  type="text"
                  placeholder="Search business name, GSTIN, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-[13px] text-[#ccc] focus:outline-none focus:border-[#3a3a3a] transition-all placeholder-[#555]"
                />
              </div>
            </div>

            {/* Clients Grid / Table */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] bg-[#141414] text-[11px] text-[#555] uppercase font-bold tracking-wider">
                      <th className="px-4 py-3">Business Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">GSTIN / State</th>
                      <th className="px-4 py-3">Email / Phone</th>
                      <th className="px-4 py-3 text-right">Invoices</th>
                      <th className="px-4 py-3 text-right">Total Billed (₹)</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded w-28"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded w-24"></div></td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="h-3.5 bg-[#222] rounded w-28"></div>
                              <div className="h-2.5 bg-[#222] rounded w-20"></div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="h-3.5 bg-[#222] rounded w-32"></div>
                              <div className="h-3 bg-[#222] rounded w-24"></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right"><div className="h-4 bg-[#222] rounded w-8 ml-auto"></div></td>
                          <td className="px-4 py-4 text-right"><div className="h-4 bg-[#222] rounded w-16 ml-auto"></div></td>
                          <td className="px-4 py-4 text-center"><div className="h-4 bg-[#222] rounded w-8 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : clients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <Info size={24} className="text-[#333] mx-auto mb-2" />
                          <p className="text-xs text-[#555]">No clients registered yet.</p>
                        </td>
                      </tr>
                    ) : (
                      clients.map((c) => (
                        <tr key={c.id} className="text-[13px] hover:bg-[#141414] transition-colors group">
                          {/* Name */}
                          <td className="px-4 py-3.5 font-medium text-[#ccc] group-hover:text-[#e2e8f0]">
                            {c.business_name}
                          </td>

                          {/* Contact Person */}
                          <td className="px-4 py-3.5 text-[#aaa]">
                            {c.contact_name || '—'}
                          </td>

                          {/* GSTIN & State */}
                          <td className="px-4 py-3.5">
                            {c.gstin ? (
                              <div className="flex flex-col">
                                <span className="font-mono text-xs text-blue-500 font-semibold">{c.gstin}</span>
                                <span className="text-[10px] text-[#555]">{c.state || '—'} ({c.state_code})</span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#555]">Unregistered Consumer</span>
                            )}
                          </td>

                          {/* Contact details */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col text-[12px] text-[#888]">
                              <span>{c.email || '—'}</span>
                              <span>{c.phone || '—'}</span>
                            </div>
                          </td>

                          {/* Invoice Count */}
                          <td className="px-4 py-3.5 text-right font-mono text-[#aaa]">
                            {c.invoice_count || 0}
                          </td>

                          {/* Total Invoiced */}
                          <td className="px-4 py-3.5 text-right font-semibold text-[#ccc] group-hover:text-[#e2e8f0]">
                            ₹{(parseFloat(c.total_invoiced) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Action Items */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(c)}
                                className="p-1 rounded text-[#555] hover:text-[#ccc] hover:bg-[#222] transition-colors"
                                title="Edit Client Profile"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Interactive Modal to Add/Edit Client */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#2a2a2a] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4 bg-[#141414]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#5e6ad2]" />
                <h3 className="text-sm font-semibold text-[#e2e8f0]">
                  {clientForm.id ? 'Edit Client Profile' : 'Register New Client'}
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-[#555] hover:text-[#ccc] transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveClient} className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Business Name" 
                  value={clientForm.businessName}
                  onChange={(e) => handleFieldChange('businessName', e.target.value)}
                  error={formErrors.businessName}
                  required
                  className="sm:col-span-2"
                  placeholder="Legal Client Business Name"
                />

                <Input 
                  label="Contact Person Name" 
                  value={clientForm.contactName}
                  onChange={(e) => handleFieldChange('contactName', e.target.value)}
                  placeholder="Primary contact name"
                />
                
                <Input 
                  label="Email Address" 
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="client@company.com"
                />

                <Input 
                  label="Phone Number" 
                  value={clientForm.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="e.g. 9876543210"
                />

                {/* GSTIN */}
                <div className="relative">
                  <Input 
                    label="GSTIN" 
                    value={clientForm.gstin}
                    onChange={handleGSTINChange}
                    error={formErrors.gstin}
                    placeholder="15-digit GSTIN (Optional)"
                    maxLength={15}
                    icon={
                      clientForm.gstin && (
                        isGstinValid ? (
                          <CheckCircle2 size={15} className="text-emerald-500" />
                        ) : (
                          <XCircle size={15} className="text-rose-500" />
                        )
                      )
                    }
                  />
                  {gstinResult?.isValid && gstinResult?.stateName && (
                    <span className="absolute right-0 top-0 text-[9px] bg-[#252525] text-[#ccc] border border-[#2a2a2a] px-1 py-0.5 rounded font-medium">
                      {gstinResult.stateName}
                    </span>
                  )}
                </div>

                {/* PAN */}
                <Input 
                  label="PAN Number" 
                  value={clientForm.pan}
                  onChange={(e) => handleFieldChange('pan', e.target.value.toUpperCase())}
                  error={formErrors.pan}
                  placeholder="10-digit PAN (e.g. ABCDE1234F)"
                  maxLength={10}
                  icon={
                    clientForm.pan && (
                      isPanValid ? (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      ) : (
                        <XCircle size={15} className="text-rose-500" />
                      )
                    )
                  }
                />

                <Input 
                  label="Billing Address" 
                  type="textarea"
                  rows={2}
                  value={clientForm.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="sm:col-span-2"
                  placeholder="Street, building, area details"
                />

                <Input 
                  label="City" 
                  value={clientForm.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="City name"
                />

                <Input 
                  label="PIN Code" 
                  value={clientForm.pinCode}
                  onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                  placeholder="6-digit ZIP code"
                  maxLength={6}
                />

                <Select 
                  label="State" 
                  value={clientForm.state}
                  onChange={handleStateChange}
                  options={stateOptions}
                  placeholder="Select State"
                  className="sm:col-span-2"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2a2a] mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="md" 
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  loading={saving}
                >
                  {clientForm.id ? 'Update Client' : 'Add Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
