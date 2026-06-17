'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Settings, Save, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, Database, HardDrive,
  User, Lock, Clock, Camera, ArrowRight, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

function SettingsContent() {
  const router = useRouter();
  const supabase = createClient();
  const mockUser = { email: 'developer@example.com' };

  // Workspace Settings states
  const [defaultTerms, setDefaultTerms] = useState('net30');
  const [showHsn, setShowHsn] = useState(true);
  const [showDiscount, setShowDiscount] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth User states
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  // Security states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // History states
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Danger zone states
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Load defaults and user data from local storage/Supabase if present
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const terms = localStorage.getItem('pref_default_terms');
        const hsn = localStorage.getItem('pref_show_hsn');
        const discount = localStorage.getItem('pref_show_discount');
        const signature = localStorage.getItem('pref_show_signature');

        if (terms) setDefaultTerms(terms);
        if (hsn !== null) setShowHsn(hsn === 'true');
        if (discount !== null) setShowDiscount(discount === 'true');
        if (signature !== null) setShowSignature(signature === 'true');

        // Parallelize database/session fetching
        await Promise.all([
          (async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                setCurrentUser(session.user);
                setUsername(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
                setAvatarUrl(session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '');
              }
            } catch (err) {
              console.error('Failed to load user profile session:', err);
            }
          })(),
          (async () => {
            try {
              const res = await fetch('/api/invoices?limit=5');
              if (res.ok) {
                const data = await res.json();
                setRecentInvoices(data.invoices || []);
              }
            } catch (err) {
              console.error('Failed to fetch activity history:', err);
            } finally {
              setHistoryLoading(false);
            }
          })()
        ]);
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [supabase]);

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setUpdatingProfile(true);
    const updateToast = toast.loading('Updating username...');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: username }
      });
      if (error) {
        toast.error(error.message, { id: updateToast });
      } else {
        toast.success('Username updated successfully!', { id: updateToast });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUser(user);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update username', { id: updateToast });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      toast.error('Profile photo must be smaller than 200 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setUpdatingPhoto(true);
      const loadingToast = toast.loading('Uploading profile photo...');
      try {
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: base64 }
        });
        if (error) {
          toast.error(error.message, { id: loadingToast });
        } else {
          toast.success('Profile picture updated successfully!', { id: loadingToast });
          setAvatarUrl(base64);
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setCurrentUser(user);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to upload photo', { id: loadingToast });
      } finally {
        setUpdatingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setUpdatingPhoto(true);
    const loadingToast = toast.loading('Removing profile photo...');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      if (error) {
        toast.error(error.message, { id: loadingToast });
      } else {
        toast.success('Profile picture removed successfully!', { id: loadingToast });
        setAvatarUrl('');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUser(user);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove photo', { id: loadingToast });
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Password cannot be empty');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setUpdatingPassword(true);
    const pwToast = toast.loading('Updating password...');
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        toast.error(error.message, { id: pwToast });
      } else {
        toast.success('Password updated successfully!', { id: pwToast });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password', { id: pwToast });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleConfirmMessage = 
      "WARNING: This will permanently delete all your registered clients, saved invoices, " +
      "and business configuration settings, and sign you out. This action CANNOT be undone.\n\n" +
      "Type 'DELETE' in the next prompt to confirm.";
    
    if (!confirm(doubleConfirmMessage)) return;
    
    const verification = prompt("Type 'DELETE' to confirm deletion:");
    if (verification !== 'DELETE') {
      toast.error('Verification failed. Deletion cancelled.');
      return;
    }

    setDeletingAccount(true);
    const deleteToast = toast.loading('Wiping database records...');
    try {
      // 1. Wipe database tables via API
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to wipe database');

      toast.loading('Signing out account...', { id: deleteToast });

      // 2. Sign out from Supabase
      await supabase.auth.signOut();

      // 3. Clear storage preferences
      localStorage.clear();

      toast.success('Account data wiped & signed out successfully!', { id: deleteToast });
      router.push('/login?mode=signup');
    } catch (err) {
      console.error(err);
      toast.error('Error deleting account data.', { id: deleteToast });
    } finally {
      setDeletingAccount(false);
    }
  };

  const isGoogleUser = currentUser?.app_metadata?.provider === 'google' || 
                        currentUser?.identities?.some(i => i.provider === 'google');

  const emailToShow = currentUser?.email ?? mockUser.email;
  const userInitial = emailToShow.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={currentUser || mockUser} />

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
              <h1 className="text-xl font-semibold text-[#e2e8f0]">Account & Workspace Settings</h1>
              <p className="text-xs text-[#555] mt-1">
                Manage your user profile, change password, check history, edit preferences, and manage databases.
              </p>
            </div>

            {loading ? (
              // Settings Page Skeleton
              <div className="flex flex-col gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 flex flex-col gap-4">
                    <div className="h-4 bg-[#222] rounded w-1/3"></div>
                    <div className="h-10 bg-[#222] rounded w-full"></div>
                    <div className="h-10 bg-[#222] rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Profile Settings Section */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2] pb-1">
                    <User size={16} className="text-[#5e6ad2]" />
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      User Profile Configuration
                    </h2>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar Upload block */}
                    <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                      <div className="relative w-20 h-20 rounded-full bg-[#1e1e1e] border border-[#2a2a2c] flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[28px] font-bold text-white uppercase">{userInitial}</span>
                        )}
                        {updatingPhoto && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 w-full items-center">
                        <label className="cursor-pointer text-[11px] font-semibold text-[#5e6ad2] hover:text-[#7b87e8] bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2c] px-2.5 py-1 rounded transition-colors text-center w-full">
                          {updatingPhoto ? 'Uploading...' : 'Upload Photo'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoUpload} 
                            disabled={updatingPhoto} 
                            className="hidden" 
                          />
                        </label>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={updatingPhoto}
                            className="text-[10px] text-rose-500 hover:text-rose-400 hover:underline"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <form onSubmit={handleUpdateProfile} className="flex-1 w-full flex flex-col gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="text"
                          value={emailToShow}
                          disabled
                          className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-[#222] text-[13px] text-[#555] cursor-not-allowed"
                        />
                        <p className="text-[10px] text-[#444] mt-1">Managed via Supabase Authentication.</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">
                          Display Name / Username
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Yasar Ahmad"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#ccc] focus:outline-none focus:border-[#5e6ad2] transition-colors"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          variant="secondary"
                          size="sm"
                          loading={updatingProfile}
                          icon={Save}
                          className="text-[#e2e8f0]"
                        >
                          Update Profile
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Password / Security Settings */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2] pb-1">
                    <Lock size={16} className="text-[#5e6ad2]" />
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Security & Password
                    </h2>
                  </div>

                  {isGoogleUser ? (
                    <div className="bg-[#18181b] border border-[#2a2a2c] rounded-xl p-4 flex items-center gap-3">
                      <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                      <div>
                        <p className="text-[12px] font-medium text-[#ccc]">Managed by Google Authentication</p>
                        <p className="text-[11px] text-[#666] mt-0.5">
                          Your account is securely logged in using Google OAuth. Credentials are managed directly by your identity provider.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#ccc] focus:outline-none focus:border-[#5e6ad2]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#ccc] focus:outline-none focus:border-[#5e6ad2]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          variant="secondary"
                          size="sm"
                          loading={updatingPassword}
                          icon={Save}
                          className="text-[#e2e8f0]"
                        >
                          Change Password
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* History Activity log */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2] pb-1">
                    <Clock size={16} className="text-[#5e6ad2]" />
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
                      Recent Activity History
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    {historyLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin h-5 w-5 text-[#5e6ad2]" />
                      </div>
                    ) : recentInvoices.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-[#2a2a2c] rounded-lg bg-[#0a0a0a]">
                        <p className="text-[11px] text-[#555]">No invoice history found. Start creating invoices to log activity.</p>
                      </div>
                    ) : (
                      <div className="border border-[#2a2a2c] bg-[#141416] rounded-lg overflow-hidden text-[12px]">
                        <div className="grid grid-cols-4 bg-[#18181c] border-b border-[#2a2a2c] px-3 py-2 text-[#555] font-bold uppercase text-[9px] tracking-wider">
                          <span>Invoice</span>
                          <span>Client</span>
                          <span className="text-right">Total (₹)</span>
                          <span className="text-center">Status</span>
                        </div>
                        <div className="divide-y divide-[#2a2a2c]">
                          {recentInvoices.map((inv) => (
                            <div key={inv.id} className="grid grid-cols-4 px-3 py-2.5 hover:bg-[#202022] transition-colors items-center">
                              <span className="font-mono text-[#ccc]">
                                <a href={`/?id=${inv.id}`} className="text-[#5e6ad2] hover:underline">
                                  {inv.invoice_number}
                                </a>
                              </span>
                              <span className="truncate text-[#888]" title={inv.buyer_data?.business_name}>
                                {inv.buyer_data?.business_name || 'Client'}
                              </span>
                              <span className="text-right font-semibold text-[#ccc]">
                                {parseFloat(inv.grand_total || 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                  inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                                }`}>
                                  {inv.status}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => router.push('/invoices')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5e6ad2] hover:text-[#7b87e8] hover:underline"
                      >
                        View Full Invoice Directory <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workspace Preferences Form */}
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

                {/* Danger Zone: Delete Account */}
                <div className="bg-[#111111] border border-rose-950 rounded-xl p-6 shadow-sm flex flex-col gap-6 bg-rose-950/5">
                  <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-rose-600 pb-1">
                    <AlertTriangle size={16} className="text-rose-500" />
                    <h2 className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                      Danger Zone
                    </h2>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <label className="text-[13px] font-medium text-rose-300 block">Delete Account & Database Records</label>
                      <span className="text-[11px] text-[#777]">Permanently wipe all of your local GST invoices, clients database entries, and reset account credentials</span>
                    </div>
                    <Button 
                      type="button"
                      variant="danger" 
                      size="md" 
                      onClick={handleDeleteAccount}
                      loading={deletingAccount}
                      icon={Trash2}
                      className="bg-rose-700 hover:bg-rose-800 border-none shrink-0"
                    >
                      Delete Account
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
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

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e6ad2] border-t-transparent"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
