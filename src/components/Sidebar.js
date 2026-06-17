'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import {
  LayoutDashboard, FileText, Users, Building2,
  Search, ChevronDown, LogOut, Settings,
  BarChart3, Plus, Loader2, Link2, FileCode, Landmark
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Invoices', icon: FileText, href: '/invoices' },
  { label: 'Clients', icon: Users, href: '/clients' },
  { label: 'Business', icon: Building2, href: '/seller' },
];

const workspaceItems = [
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

function NavItem({ item, active }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(item.href)}
      className={`w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] transition-all duration-100 group ${
        active
          ? 'bg-[#252525] text-[#e2e8f0]'
          : 'text-[#888] hover:bg-[#1e1e1e] hover:text-[#ccc]'
      }`}
    >
      <item.icon
        size={14}
        className={active ? 'text-[#5e6ad2]' : 'text-[#555] group-hover:text-[#888]'}
        strokeWidth={2}
      />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export default function Sidebar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [signingOut, setSigningOut] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  // Search data states
  const [invoiceResults, setInvoiceResults] = useState([]);
  const [clientResults, setClientResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation active index state
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    localStorage.removeItem('user_logged_in');
    router.push('/login');
    router.refresh();
  };

  // Keyboard listener to open search modal (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search results on query change (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setInvoiceResults([]);
      setClientResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [invRes, cliRes] = await Promise.all([
          fetch(`/api/invoices?search=${encodeURIComponent(query)}&limit=5`),
          fetch(`/api/clients?search=${encodeURIComponent(query)}`)
        ]);

        let invData = [];
        if (invRes.ok) {
          const body = await invRes.json();
          invData = body.invoices || [];
        }

        let cliData = [];
        if (cliRes.ok) {
          cliData = await cliRes.json();
        }

        setInvoiceResults(invData);
        setClientResults(cliData);
        setActiveIndex(0); // Reset selection
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 250);

    return () => clearTimeout(debounce);
  }, [query]);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setQuery('');
      setActiveIndex(0);
    }
  }, [searchOpen]);

  // Flat list of matching items for unified keyboard index navigation
  const navigationActions = [
    { type: 'nav', label: 'Go to Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { type: 'nav', label: 'Go to Invoices List', href: '/invoices', icon: FileText },
    { type: 'nav', label: 'Go to Clients List', href: '/clients', icon: Users },
    { type: 'nav', label: 'Go to Business Setup', href: '/seller', icon: Building2 },
    { type: 'nav', label: 'Go to GSTR-1 Analytics', href: '/analytics', icon: BarChart3 },
    { type: 'nav', label: 'Go to Workspace Settings', href: '/settings', icon: Settings },
    { type: 'nav', label: 'Create New GST Invoice', href: '/', icon: Plus },
  ];

  const filteredNavActions = query.trim() 
    ? navigationActions.filter(action => action.label.toLowerCase().includes(query.toLowerCase()))
    : navigationActions;

  const flatItems = [
    ...filteredNavActions,
    ...invoiceResults.map(inv => ({
      type: 'invoice',
      label: `Invoice ${inv.invoice_number}`,
      sub: `Billed to ${inv.buyer_data?.business_name || 'Client'} • ₹${(parseFloat(inv.grand_total) || 0).toLocaleString('en-IN')}`,
      href: `/?id=${inv.id}`,
      icon: FileCode
    })),
    ...clientResults.map(cli => ({
      type: 'client',
      label: cli.business_name,
      sub: cli.email ? `Email: ${cli.email}` : `GSTIN: ${cli.gstin || 'Consumer'}`,
      href: `/clients`,
      icon: Users
    }))
  ];

  const handleSelectItem = (item) => {
    if (!item) return;
    router.push(item.href);
    setSearchOpen(false);
    setQuery('');
  };

  // Listen to keyboard controls inside modal
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(flatItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[activeIndex]) {
        handleSelectItem(flatItems[activeIndex]);
      }
    }
  };

  const userInitial = user?.email?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <aside className="w-[220px] shrink-0 border-r border-[#2a2a2a] bg-[#111111] flex flex-col h-screen">
      {/* Workspace Header */}
      <div className="h-11 flex items-center px-3 border-b border-[#2a2a2a] gap-2 shrink-0">
        <Image src="/logo.png" alt="TaxFlow Logo" width={20} height={20} className="rounded object-contain shrink-0" />
        <span className="text-[13px] font-semibold text-[#e2e8f0] flex-1 truncate">TaxFlow</span>
        <span className="text-[10px] text-[#555] bg-[#1e1e1e] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-medium shrink-0">GST</span>
        <ChevronDown size={13} className="text-[#555] shrink-0" />
      </div>

      {/* Search Bar Trigger */}
      <div className="px-2 pt-2 pb-1 shrink-0">
        <button 
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md bg-transparent hover:bg-[#1e1e1e] transition-colors group text-left"
        >
          <Search size={13} className="text-[#555] group-hover:text-[#888]" />
          <span className="text-[13px] text-[#555] group-hover:text-[#888] transition-colors">Search...</span>
          <span className="ml-auto text-[10px] text-[#444] border border-[#2a2a2a] rounded px-1">⌘K</span>
        </button>
      </div>

      {/* Main Nav */}
      <nav className="px-2 py-1 flex flex-col gap-[1px] shrink-0">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-2 my-1 border-t border-[#1e1e1e]" />

      {/* Workspace Section */}
      <div className="px-2 py-1 shrink-0">
        <p className="text-[10px] font-semibold text-[#444] uppercase tracking-wider px-2.5 pb-1">
          Workspace
        </p>
        {workspaceItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </div>

      {/* Favorites / Quick links */}
      <div className="px-2 py-1 flex-1">
        <p className="text-[10px] font-semibold text-[#444] uppercase tracking-wider px-2.5 pb-1 flex items-center justify-between">
          Favorites
          <button className="text-[#444] hover:text-[#777] transition-colors">
            <Plus size={12} />
          </button>
        </p>
        <button onClick={() => router.push('/invoices?status=unpaid')} className="w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] text-[#666] hover:text-[#999] hover:bg-[#1e1e1e] transition-all text-left">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500/80 shrink-0" />
          <span className="truncate">Unpaid Invoices</span>
        </button>
        <button onClick={() => router.push('/analytics')} className="w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] text-[#666] hover:text-[#999] hover:bg-[#1e1e1e] transition-all text-left">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shrink-0" />
          <span className="truncate">Revenue Analytics</span>
        </button>
      </div>

      {/* User footer */}
      <div className="border-t border-[#2a2a2a] px-2 py-2 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#1e1e1e] transition-colors cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-[#5e6ad2] flex items-center justify-center shrink-0 text-[11px] font-bold text-white">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-[#ccc] truncate leading-tight">{user?.email ?? 'User'}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#555] hover:text-[#e2e8f0]"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  APPLE SPOTLIGHT COMMAND PALETTE SEARCH MODAL                */}
      {/* ============================================================ */}
      {searchOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-200"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="w-full max-w-[550px] bg-[#161617]/95 border border-[#2a2a2c] rounded-xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
          >
            {/* Input Header bar */}
            <div className="relative border-b border-[#2a2a2c] flex items-center px-4 py-3">
              <Search size={16} className="text-[#86868b] shrink-0 mr-3" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search invoices, clients, or configuration..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-[14px] text-[#e8e8ed] placeholder-[#86868b] focus:outline-none"
              />
              {loading && <Loader2 size={14} className="animate-spin text-[#86868b] shrink-0 ml-2" />}
              <span className="text-[10px] text-[#86868b] bg-[#222] border border-[#333] px-1.5 py-0.5 rounded ml-2 shrink-0 select-none">ESC</span>
            </div>

            {/* Results body */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
              
              {/* Category 1: Navigation shortcuts */}
              {filteredNavActions.length > 0 && (
                <div>
                  <h4 className="text-[9px] text-[#86868b] uppercase font-bold tracking-wider px-3 py-1.5">Navigation Suggestions</h4>
                  {filteredNavActions.map((action, idx) => {
                    const flatIdx = idx;
                    const isSelected = activeIndex === flatIdx;
                    return (
                      <div 
                        key={`nav-${idx}`}
                        onClick={() => handleSelectItem(action)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-[#5e6ad2] text-white' : 'text-[#e8e8ed] hover:bg-[#202022]'
                        }`}
                      >
                        <action.icon size={14} className={isSelected ? 'text-white' : 'text-[#86868b]'} />
                        <span className="text-[13px] font-medium">{action.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category 2: Invoices */}
              {invoiceResults.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-[9px] text-[#86868b] uppercase font-bold tracking-wider px-3 py-1.5">GST Invoices</h4>
                  {invoiceResults.map((inv, idx) => {
                    const flatIdx = filteredNavActions.length + idx;
                    const isSelected = activeIndex === flatIdx;
                    const displayItem = {
                      label: `Invoice ${inv.invoice_number}`,
                      sub: `Billed to ${inv.buyer_data?.business_name || 'Client'} • ₹${(parseFloat(inv.grand_total) || 0).toLocaleString('en-IN')}`,
                      href: `/?id=${inv.id}`
                    };

                    return (
                      <div 
                        key={`inv-${inv.id}`}
                        onClick={() => handleSelectItem(displayItem)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-[#5e6ad2] text-white' : 'text-[#e8e8ed] hover:bg-[#202022]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCode size={14} className={isSelected ? 'text-white' : 'text-[#86868b]'} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-medium font-mono">{displayItem.label}</span>
                            <span className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[#86868b]'}`}>{displayItem.sub}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-2 uppercase shrink-0 border ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category 3: Clients */}
              {clientResults.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-[9px] text-[#86868b] uppercase font-bold tracking-wider px-3 py-1.5">Clients</h4>
                  {clientResults.map((cli, idx) => {
                    const flatIdx = filteredNavActions.length + invoiceResults.length + idx;
                    const isSelected = activeIndex === flatIdx;
                    const displayItem = {
                      label: cli.business_name,
                      sub: cli.email ? `Email: ${cli.email}` : `GSTIN: ${cli.gstin || 'Consumer'}`,
                      href: `/clients`
                    };

                    return (
                      <div 
                        key={`cli-${cli.id}`}
                        onClick={() => handleSelectItem(displayItem)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-[#5e6ad2] text-white' : 'text-[#e8e8ed] hover:bg-[#202022]'
                        }`}
                      >
                        <Users size={14} className={isSelected ? 'text-white' : 'text-[#86868b]'} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium truncate">{displayItem.label}</span>
                          <span className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[#86868b]'}`}>{displayItem.sub}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state inside results */}
              {flatItems.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-xs text-[#555]">No matches found for &ldquo;{query}&rdquo;</span>
                </div>
              )}
            </div>

            {/* Quick hotkey footer */}
            <div className="border-t border-[#2a2a2c] bg-[#1a1a1c] px-4 py-2 flex items-center justify-between text-[11px] text-[#86868b] select-none">
              <div className="flex items-center gap-3">
                <span><kbd className="bg-[#2a2a2c] px-1 py-0.5 rounded text-[10px] text-[#ccc]">↑↓</kbd> to navigate</span>
                <span><kbd className="bg-[#2a2a2c] px-1 py-0.5 rounded text-[10px] text-[#ccc]">Enter</kbd> to select</span>
              </div>
              <div>
                <span>Press <kbd className="bg-[#2a2a2c] px-1 py-0.5 rounded text-[10px] text-[#ccc]">ESC</kbd> to close</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </aside>
  );
}
