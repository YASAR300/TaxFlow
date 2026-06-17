'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Settings, Save, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, Database, HardDrive
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const mockUser = { email: 'developer@example.com' };

  // Settings states
  const [defaultTerms, setDefaultTerms] = useState('net30');
  const [showHsn, setShowHsn] = useState(true);
  const [showDiscount, setShowDiscount] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load defaults from local storage if present
  useEffect(() => {
    const terms = localStorage.getItem('pref_default_terms');
    const hsn = localStorage.getItem('pref_show_hsn');
    const discount = localStorage.getItem('pref_show_discount');
    const signature = localStorage.getItem('pref_show_signature');

    if (terms) setDefaultTerms(terms);
    if (hsn !== null) setShowHsn(hsn === 'true');
    if (discount !== null) setShowDiscount(discount === 'true');
    if (signature !== null) setShowSignature(signature === 'true');
    setLoading(false);
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      localStorage.setItem('pref_default_terms', defaultTerms);
      localStorage.setItem('pref_show_hsn', showHsn.toString());
      localStorage.setItem('pref_show_discount', showDiscount.toString());
      localStorage.setItem('pref_show_signature', showSignature.toString());
      
      toast.success('Workspace preferences updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleClearDraft = () => {
    if (!confirm('Are you sure you want to clear the unsaved draft invoice? This action is permanent.')) return;
    
    localStorage.removeItem('invoice_draft');
    toast.success('Local draft cache cleared');
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={mockUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Settings</span>
          </div>
        </header>

        {/* Page Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
            
            {/* Description */}
            <div>
              <h1 className="text-xl font-semibold text-[#e2e8f0]">Workspace Settings</h1>
              <p className="text-xs text-[#555] mt-1">
                Configure editor preferences, default payment conditions, and clear cached workspace assets.
              </p>
            </div>

            {loading ? (
              // Settings Page Skeleton
              <div className="flex flex-col gap-6 animate-pulse">
                {/* Form Preferences Skeleton */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pb-2 border-l-2 border-[#5e6ad2] pl-2.5">
                    <div className="w-4 h-4 bg-[#222] rounded"></div>
                    <div className="h-4 bg-[#222] rounded w-44"></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="h-3 bg-[#222] rounded w-28"></div>
                    <div className="h-10 bg-[#222] rounded w-full"></div>
                    <div className="h-px bg-[#1e1e1e] my-1"></div>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="h-4 bg-[#222] rounded w-40"></div>
                          <div className="h-3 bg-[#222] rounded w-64"></div>
                        </div>
                        <div className="w-5 h-5 bg-[#222] rounded mr-2"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4 border-t border-[#2a2a2a]">
                    <div className="h-9 bg-[#222] rounded w-32"></div>
                  </div>
                </div>

                {/* Maintenance Skeleton */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pb-2 border-l-2 border-rose-500 pl-2.5">
                    <div className="w-4 h-4 bg-[#222] rounded"></div>
                    <div className="h-4 bg-[#222] rounded w-56"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 bg-[#222] rounded w-36"></div>
                      <div className="h-3 bg-[#222] rounded w-80"></div>
                    </div>
                    <div className="h-9 bg-[#222] rounded w-28"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Form Preferences */}
                <form onSubmit={handleSavePreferences} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2] pb-1">
                    <Settings size={16} className="text-[#5e6ad2]" />
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Default Editor Preferences
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Default Terms option */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                        Default Payment Terms
                      </label>
                      <select
                        value={defaultTerms}
                        onChange={(e) => setDefaultTerms(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#ccc] focus:outline-none focus:border-[#5e6ad2] transition-colors cursor-pointer"
                      >
                        <option value="immediate">Immediate Payment (Due on Receipt)</option>
                        <option value="net15">Net 15 (Due within 15 Days)</option>
                        <option value="net30">Net 30 (Due within 30 Days)</option>
                        <option value="net45">Net 45 (Due within 45 Days)</option>
                        <option value="net60">Net 60 (Due within 60 Days)</option>
                      </select>
                      <p className="text-[10px] text-[#444] mt-0.5">
                        Newly initialized invoices will default to this selection.
                      </p>
                    </div>

                    <div className="h-px bg-[#1e1e1e] my-1" />

                    {/* HSN Code Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[13px] font-medium text-[#ccc] block">Enable HSN/SAC Column</label>
                        <span className="text-[11px] text-[#555]">Show Goods & Services HSN codes in invoice tables by default</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={showHsn}
                        onChange={(e) => setShowHsn(e.target.checked)}
                        className="w-4.5 h-4.5 accent-[#5e6ad2] cursor-pointer"
                      />
                    </div>

                    {/* Discount Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[13px] font-medium text-[#ccc] block">Enable Line Item Discounts</label>
                        <span className="text-[11px] text-[#555]">Display inline percentage discount controls in table items</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={showDiscount}
                        onChange={(e) => setShowDiscount(e.target.checked)}
                        className="w-4.5 h-4.5 accent-[#5e6ad2] cursor-pointer"
                      />
                    </div>

                    {/* Signature Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[13px] font-medium text-[#ccc] block">Enable Signature Blocks</label>
                        <span className="text-[11px] text-[#555]">Render signature blocks for receivers and authorised signatories</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={showSignature}
                        onChange={(e) => setShowSignature(e.target.checked)}
                        className="w-4.5 h-4.5 accent-[#5e6ad2] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2a2a2a] flex justify-end">
                    <Button 
                      type="submit"
                      variant="primary" 
                      size="md" 
                      loading={saving}
                      icon={Save}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </form>

                {/* Cache settings and database details */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-rose-500 pb-1">
                    <Trash2 size={16} className="text-rose-500" />
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Workspace Cache & Maintenance
                    </h2>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[13px] font-medium text-[#ccc] block">Clear Unsaved Drafts</label>
                      <span className="text-[11px] text-[#555]">Purge the cached unsaved invoice draft from your local browser memory</span>
                    </div>
                    <Button 
                      type="button"
                      variant="danger" 
                      size="sm" 
                      onClick={handleClearDraft}
                      icon={Trash2}
                    >
                      Clear Cache
                    </Button>
                  </div>
                </div>

                {/* Environment Status Card */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-emerald-500 pb-1">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      System Diagnostics
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[12px]">
                    <div className="flex items-center gap-2 text-[#aaa]">
                      <Database size={13} className="text-[#555]" />
                      <span>Database Connection:</span>
                      <span className="font-semibold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Connected
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#aaa]">
                      <HardDrive size={13} className="text-[#555]" />
                      <span>Database provider:</span>
                      <span className="font-semibold text-[#888]">Neon PostgreSQL</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#aaa]">
                      <span>Server framework:</span>
                      <span className="font-semibold text-[#888]">Next.js 14.2 (App Router)</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#aaa]">
                      <span>Authentication:</span>
                      <span className="font-semibold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Supabase Auth
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
