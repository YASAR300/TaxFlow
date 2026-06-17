'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  LayoutDashboard, FileText, Users, Building2,
  Search, ChevronDown, LogOut, Settings,
  Inbox, Star, BarChart3, Zap, Plus
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
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

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userInitial = user?.email?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <aside className="w-[220px] shrink-0 border-r border-[#2a2a2a] bg-[#111111] flex flex-col h-screen">
      {/* Workspace Header */}
      <div className="h-11 flex items-center px-3 border-b border-[#2a2a2a] gap-2 shrink-0">
        <div className="w-5 h-5 rounded bg-[#5e6ad2] flex items-center justify-center shrink-0">
          <Zap size={11} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[13px] font-semibold text-[#e2e8f0] flex-1 truncate">TaxFlow</span>
        <span className="text-[10px] text-[#555] bg-[#1e1e1e] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-medium shrink-0">GST</span>
        <ChevronDown size={13} className="text-[#555] shrink-0" />
      </div>

      {/* Search */}
      <div className="px-2 pt-2 pb-1 shrink-0">
        <button className="w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md bg-transparent hover:bg-[#1e1e1e] transition-colors group">
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
        <button className="w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] text-[#666] hover:text-[#999] hover:bg-[#1e1e1e] transition-all">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500/80 shrink-0" />
          <span className="truncate">Unpaid Invoices</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[13px] text-[#666] hover:text-[#999] hover:bg-[#1e1e1e] transition-all">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shrink-0" />
          <span className="truncate">This Month</span>
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
    </aside>
  );
}
