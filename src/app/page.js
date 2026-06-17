'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  FileText, Users, TrendingUp, Shield, Zap, Download,
  ChevronRight, ArrowRight, Check, Star, Menu, X,
  BarChart2, Clock, Globe, Lock, Layers, Sparkles,
  Search, Calendar, ArrowUpRight, HelpCircle
} from 'lucide-react';

// ── 3D Isometric SVG Wireframes ──────────────────────────────────────────────

function CubeWireframe() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-white/20 group-hover:text-white/40 transition-colors duration-500">
      {/* Outer Cube */}
      <path d="M60 20 L95 40 L95 80 L60 100 L25 80 L25 40 Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      {/* Front edges */}
      <path d="M60 20 L60 100" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 40 L60 60 L95 40" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 60 L60 100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Inner lines showing depth */}
      <path d="M25 80 L60 60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M95 80 L60 60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

function TorusWireframe() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-white/20 group-hover:text-white/40 transition-colors duration-500">
      {/* Concentric Ellipses for 3D Torus */}
      <ellipse cx="60" cy="60" rx="45" ry="22" stroke="currentColor" strokeWidth="1" transform="rotate(-15 60 60)" />
      <ellipse cx="60" cy="60" rx="30" ry="15" stroke="currentColor" strokeWidth="0.8" transform="rotate(-15 60 60)" />
      <ellipse cx="60" cy="60" rx="15" ry="7.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" transform="rotate(-15 60 60)" />

      {/* Connecting ribs */}
      <path d="M15 60 C15 45, 105 45, 105 60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M15 60 C15 75, 105 75, 105 60" stroke="currentColor" strokeWidth="1" />
      <path d="M60 15 L60 105" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

function CylinderWireframe() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-white/20 group-hover:text-white/40 transition-colors duration-500">
      {/* Top Ellipse */}
      <ellipse cx="60" cy="35" rx="35" ry="12" stroke="currentColor" strokeWidth="1" />
      {/* Bottom Ellipse */}
      <path d="M25 85 C25 97, 95 97, 95 85" stroke="currentColor" strokeWidth="1" />
      <path d="M25 85 C25 73, 95 73, 95 85" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />

      {/* Vertical Sides */}
      <path d="M25 35 L25 85" stroke="currentColor" strokeWidth="1" />
      <path d="M95 35 L95 85" stroke="currentColor" strokeWidth="1" />
      <path d="M60 47 L60 97" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}


// ── Hero Dashboard Mockup ───────────────────────────────────────────────────

function HeroDashboardPreview() {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0c0e] shadow-[0_0_100px_rgba(94,106,210,0.12)]">
      {/* Window Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#08080a] border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.02] border border-white/[0.04] text-[10px] text-[#666] w-64 justify-between">
          <span className="flex items-center gap-1"><Search size={10} /> Search invoices, clients...</span>
          <span className="text-[9px] bg-white/[0.05] px-1 rounded">⌘K</span>
        </div>
        <div className="w-14" />
      </div>

      {/* Main Container */}
      <div className="flex h-[520px] text-[#8a8b98] text-xs">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/[0.04] bg-[#08080a] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 py-1 bg-white/[0.03] border border-white/[0.05] rounded-md">
              <Image src="/logo.png" alt="TaxFlow Logo" width={18} height={18} className="rounded object-contain" />
              <div className="text-left leading-none">
                <p className="text-[11px] font-medium text-white">TaxFlow Workspace</p>
                <p className="text-[9px] text-[#555]">Standard Plan</p>
              </div>
            </div>

            <div className="space-y-1">
              {[
                { label: 'Inbox', count: '3', icon: FileText, active: false },
                { label: 'My Invoices', count: null, icon: BarChart2, active: true },
                { label: 'Clients', count: '14', icon: Users, active: false },
                { label: 'GSTR Filing', count: 'Draft', icon: Layers, active: false },
                { label: 'Settings', count: null, icon: Lock, active: false }
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${item.active ? 'bg-white/[0.05] text-white' : 'hover:bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-2">
                    <item.icon size={13} className={item.active ? 'text-white' : 'text-[#555]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.count && <span className="text-[9px] px-1 bg-white/[0.06] rounded text-[#666]">{item.count}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center justify-between px-2 text-[#555] text-[10px] uppercase font-bold tracking-wider">
              <span>Quick Actions</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] text-[#666] hover:text-white cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>New GST Invoice</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] text-[#666] hover:text-white cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Export GSTR-1 Summary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Invoices List View */}
        <div className="flex-1 bg-[#09090b] flex flex-col">
          {/* List Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04] bg-[#08080a]/50">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-white">Invoices</span>
              <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.05] rounded px-2 py-0.5 text-[10px]">
                <span>Status: All</span>
                <ChevronRight size={10} className="rotate-90 text-[#555]" />
              </div>
            </div>
            <button className="bg-[#5e6ad2] hover:bg-[#4f5abf] transition-colors text-white text-[11px] px-2.5 py-1 rounded font-medium">
              + Create Invoice
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto">
            {[
              { id: 'INV-2026-089', client: 'Vercel Inc.', amount: '₹1,47,500', date: 'Jun 15', status: 'Paid', accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
              { id: 'INV-2026-088', client: 'Razorpay Software', amount: '₹88,200', date: 'Jun 12', status: 'Sent', accent: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
              { id: 'INV-2026-087', client: 'Cred Pay', amount: '₹2,10,000', date: 'Jun 10', status: 'Overdue', accent: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
              { id: 'INV-2026-086', client: 'Graphy Design', amount: '₹45,000', date: 'Jun 08', status: 'Paid', accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
              { id: 'INV-2026-085', client: 'Groww Assets', amount: '₹1,22,500', date: 'Jun 05', status: 'Draft', accent: 'bg-white/5 text-[#888] border-white/10' },
              { id: 'INV-2026-084', client: 'Descript Media', amount: '₹64,000', date: 'May 28', status: 'Paid', accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
            ].map((inv, idx) => (
              <div key={inv.id} className={`flex items-center justify-between px-6 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors cursor-pointer ${idx === 1 ? 'bg-white/[0.02]' : ''}`}>
                <div className="flex items-center gap-3">
                  <FileText size={14} className={idx === 1 ? 'text-[#5e6ad2]' : 'text-[#444]'} />
                  <div>
                    <span className="font-semibold text-white">{inv.id}</span>
                    <span className="mx-2 text-[#444]">•</span>
                    <span>{inv.client}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span>{inv.date}</span>
                  <span className="font-semibold text-white w-20 text-right">{inv.amount}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${inv.accent} font-medium`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Detail Right Pane */}
        <div className="w-80 border-l border-white/[0.04] bg-[#08080a] p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#555]">Details</span>
              <span className="text-[10px] text-[#666]">INV-2026-088</span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-[#555]">Client Name</p>
                <p className="text-white font-medium">Razorpay Software Pvt Ltd</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-[#555]">GSTIN</p>
                  <p className="text-[#a1a1aa] font-mono">27AAPCR1206M1Z8</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555]">Place of Supply</p>
                  <p className="text-[#a1a1aa]">Maharashtra (27)</p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/[0.04] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#555]">Subtotal</span>
                  <span className="text-white font-mono">₹74,745.76</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">CGST (9%)</span>
                  <span className="text-white font-mono">₹6,727.12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">SGST (9%)</span>
                  <span className="text-white font-mono">₹6,727.12</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-white/[0.04] pt-2">
                  <span className="text-white">Total GST Amount</span>
                  <span className="text-emerald-400 font-mono">₹88,200.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/[0.04]">
            <button className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white text-[11px] py-1.5 rounded font-medium flex items-center justify-center gap-1.5 transition-colors">
              <Download size={12} /> Download Invoice PDF
            </button>
            <button className="w-full bg-[#5e6ad2]/10 hover:bg-[#5e6ad2]/20 text-[#5e6ad2] text-[11px] py-1.5 rounded font-medium transition-colors">
              Share Invoice Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Main Page Component ──────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check localStorage first for instant UI response
    const flag = localStorage.getItem('user_logged_in');
    if (flag === 'true') {
      setIsLoggedIn(true);
    }

    // Validate with supabase in background
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem('user_logged_in', 'true');
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('user_logged_in');
      }
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#f7f7f8] relative">


      {/* Top Background Radial Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#5e6ad2]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── Header Navigation ───────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-black/75 backdrop-blur-[12px] border-b border-white/[0.08] py-3'
          : 'bg-transparent border-b border-transparent py-4'
        }`}>
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 z-50 group">
            <Image src="/logo.png" alt="TaxFlow Logo" width={22} height={22} className="rounded-md object-contain transition-transform group-hover:scale-[1.05]" />
            <span className="text-[14px] font-semibold tracking-tight text-white">TaxFlow</span>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 text-[12px] font-medium text-[#8a8b98]">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#compliance" className="hover:text-white transition-colors">Compliance</Link>
            <Link href="#roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4 text-[12px] font-medium">
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-white hover:bg-white/90 text-black px-3.5 py-1.5 rounded-full font-medium transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[#8a8b98] hover:text-white transition-colors py-1">Log in</Link>
                <Link href="/login?mode=signup" className="bg-white hover:bg-white/90 text-black px-3.5 py-1.5 rounded-full font-medium transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                  Sign up free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#8a8b98] hover:text-white z-50" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Navigation overlay */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-md pt-20 px-6 flex flex-col gap-6 z-40">
            <Link href="#features" className="text-lg text-[#8a8b98] hover:text-white" onClick={() => setMenuOpen(false)}>Features</Link>
            <Link href="#compliance" className="text-lg text-[#8a8b98] hover:text-white" onClick={() => setMenuOpen(false)}>Compliance</Link>
            <Link href="#roadmap" className="text-lg text-[#8a8b98] hover:text-white" onClick={() => setMenuOpen(false)}>Roadmap</Link>
            <Link href="/dashboard" className="text-lg text-[#8a8b98] hover:text-white" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <div className="h-[1px] bg-white/[0.08] my-2" />
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-center py-2.5 bg-white text-black rounded-full font-semibold" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-lg text-[#8a8b98] hover:text-white" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link href="/login?mode=signup" className="text-center py-2.5 bg-white text-black rounded-full font-semibold" onClick={() => setMenuOpen(false)}>Sign up free</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 md:pt-40 pb-20 px-6 text-center z-10">
        <div className="max-w-[1280px] mx-auto">
          {/* Badge Release */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-white/60 text-[11px] font-medium mb-8 hover:bg-white/[0.04] transition-colors cursor-pointer">
            <Sparkles size={11} className="text-[#5e6ad2]" />
            <span>TaxFlow 2026: The Invoicing Release</span>
            <ChevronRight size={10} className="text-[#555]" />
          </div>

          {/* Heading */}
          <h1 className="text-[44px] sm:text-[60px] md:text-[80px] font-bold tracking-tight leading-[1.05] mb-6 gradient-text-hero">
            The invoicing system<br />for teams and freelancers
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] md:text-[18px] text-[#8a8b98] max-w-xl mx-auto mb-10 leading-relaxed">
            TaxFlow is a better way to generate GST-compliant invoices, track client receivables, and automate your Indian tax workflow. Purpose-built for modern teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-24">
            {isLoggedIn ? (
              <Link href="/dashboard" className="group bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                Go to Dashboard
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/login?mode=signup" className="group bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                  Get started free
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/dashboard" className="border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] text-white px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all">
                  Open Dashboard
                  <ChevronRight size={12} className="text-[#555]" />
                </Link>
              </>
            )}
          </div>

          {/* App Preview Mockup */}
          <HeroDashboardPreview />
        </div>
      </section>

      {/* ── Customer Logos ─────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.05] bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-[11px] font-semibold text-[#555] uppercase tracking-wider text-center mb-8">
            Powering invoicing for India&apos;s leading teams
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-8 items-center justify-center opacity-40 hover:opacity-60 transition-opacity">
            {['Vercel', 'Retool', 'Descript', 'Pitch', 'Raycast', 'Ramp', 'Mercury', 'OpenAI'].map((logo, index) => (
              <span key={index} className="text-center font-bold tracking-wider text-[13px] text-white hover:text-white transition-colors">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro Block & Wireframes Grid ─────────────────────────────────── */}
      <section className="py-28 px-6 bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          {/* Subheading Intro */}
          <div className="max-w-3xl mb-24 text-left">
            <h2 className="text-[20px] md:text-[28px] leading-snug text-white font-medium max-w-2xl">
              A new standard for billing & compliance. Purpose-built for modern Indian startups, CA firms, and freelancers. TaxFlow sets a new standard for planning, issuing, and filing invoices.
            </h2>
          </div>

          {/* 3-Column Wireframe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.1] rounded-xl p-8 flex flex-col items-center text-center transition-all duration-300">
              <div className="h-32 flex items-center justify-center mb-6">
                <CubeWireframe />
              </div>
              <h3 className="text-white text-[14px] font-semibold mb-2">Built for teams</h3>
              <p className="text-[12px] text-[#8a8b98] leading-relaxed max-w-[240px]">
                Collaborative billing workspace, shared client directories, and multi-user team roles.
              </p>
            </div>

            <div className="group border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.1] rounded-xl p-8 flex flex-col items-center text-center transition-all duration-300">
              <div className="h-32 flex items-center justify-center mb-6">
                <TorusWireframe />
              </div>
              <h3 className="text-white text-[14px] font-semibold mb-2">Built for speed</h3>
              <p className="text-[12px] text-[#8a8b98] leading-relaxed max-w-[240px]">
                Generate tax-compliant invoices in under 30 seconds. Powered by keyboard shortcuts.
              </p>
            </div>

            <div className="group border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.1] rounded-xl p-8 flex flex-col items-center text-center transition-all duration-300">
              <div className="h-32 flex items-center justify-center mb-6">
                <CylinderWireframe />
              </div>
              <h3 className="text-white text-[14px] font-semibold mb-2">Built for compliance</h3>
              <p className="text-[12px] text-[#8a8b98] leading-relaxed max-w-[240px]">
                Automatic CGST, SGST, and IGST calculations with instant HSN lookup and validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase Section 1: Invoicing & Calculations ──────────── */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.05] bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          {/* Header Split: Left Title, Right Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-none">
                Make billing decisions, not accounting errors.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-[15px] text-[#8a8b98] leading-relaxed">
                Manual calculations lead to tax audit issues. TaxFlow automates CGST, SGST, and IGST division based on buyer states, pre-loads active HSN codes, and checks GSTIN checksum structures automatically.
              </p>
            </div>
          </div>

          {/* Visual Showcase: Interactive Form Calculation Mockup */}
          <div className="rounded-xl border border-white/[0.06] bg-[#08080a] p-8 overflow-hidden relative shadow-[0_0_80px_rgba(94,106,210,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Input Side */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Invoice Editor</span>
                  <span className="text-[11px] text-[#555]">Draft Mode</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#555] uppercase font-bold">Client Name</label>
                    <input type="text" disabled value="Razorpay Software Pvt Ltd" className="w-full bg-white/[0.02] border border-white/[0.06] rounded px-3 py-2 text-white text-xs font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#555] uppercase font-bold">Client GSTIN</label>
                    <input type="text" disabled value="27AAPCR1206M1Z8" className="w-full bg-white/[0.02] border border-white/[0.06] rounded px-3 py-2 text-white font-mono text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#555] uppercase font-bold">Supply State</label>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded px-3 py-2 text-white text-xs font-medium flex items-center justify-between">
                      <span>Maharashtra (27)</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 rounded">Intra-State</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#555] uppercase font-bold">HSN Code</label>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded px-3 py-2 text-white text-xs font-medium">
                      <span>998311 (Software)</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#555] uppercase font-bold">Tax Rate</label>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded px-3 py-2 text-white text-xs font-medium">
                      <span>18% (GST)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center text-[10px] text-[#555] uppercase font-bold mb-2">
                    <span>Line Item Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.04] rounded px-4 py-3">
                    <div className="text-left">
                      <p className="text-white font-medium text-xs">Custom Cloud Development Services</p>
                      <p className="text-[10px] text-[#555]">Milestone 2 - API Architecture Refactoring</p>
                    </div>
                    <span className="text-white font-mono text-xs font-semibold">₹1,00,000.00</span>
                  </div>
                </div>
              </div>

              {/* Live Calculations Summary Side */}
              <div className="lg:col-span-5 bg-white/[0.01] border border-white/[0.05] rounded-lg p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider block">Live Tax Summary</span>
                  <div className="space-y-2.5 text-xs text-[#8a8b98]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-mono">₹1,00,000.00</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/[0.02] px-2 py-1 rounded border border-white/[0.04]">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> CGST (9%)</span>
                      <span className="text-white font-mono">₹9,000.00</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/[0.02] px-2 py-1 rounded border border-white/[0.04]">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> SGST (9%)</span>
                      <span className="text-white font-mono">₹9,000.00</span>
                    </div>
                    <div className="flex justify-between text-[#555] pt-1">
                      <span>IGST (Integrated)</span>
                      <span className="font-mono">₹0.00</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.04] mt-6 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-white font-semibold">Total Amount Due</span>
                    <span className="text-white text-xl font-bold font-mono">₹1,18,000.00</span>
                  </div>
                  <div className="text-[10px] bg-white/[0.02] border border-white/[0.05] rounded p-2 text-[#666] font-medium leading-relaxed">
                    <span className="text-[9px] uppercase font-bold text-[#555] block mb-0.5">Amount in words:</span>
                    Rupees One Lakh Eighteen Thousand Only.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase Section 2: Invoices Timeline Roadmap ─────────── */}
      <section id="roadmap" className="py-24 px-6 border-t border-white/[0.05] bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          {/* Header Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-none">
                Define the invoicing roadmap.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-[15px] text-[#8a8b98] leading-relaxed">
                Stay on top of payout schedules. TaxFlow gives you a calendarized timeline view of all active, overdue, and pending invoices. Know exactly when your business cash inflows are hitting your accounts.
              </p>
            </div>
          </div>

          {/* Visual Showcase: Gantt Chart Invoice Timeline */}
          <div className="rounded-xl border border-white/[0.06] bg-[#08080a] p-6 overflow-hidden relative shadow-[0_0_80px_rgba(94,106,210,0.08)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.04] mb-6 text-xs text-[#555]">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white">Q2 Payout Timeline</span>
                <span className="bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">All clients</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Paid</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Sent</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500" /> Overdue</span>
              </div>
            </div>

            {/* Timeline UI */}
            <div className="space-y-4 font-mono text-[11px]">
              {/* Timeline Header Dates */}
              <div className="grid grid-cols-12 text-center text-[#444] border-b border-white/[0.03] pb-2">
                <div className="col-span-3 text-left">CLIENT</div>
                <div className="col-span-3">APRIL</div>
                <div className="col-span-3">MAY</div>
                <div className="col-span-3">JUNE</div>
              </div>

              {[
                { name: 'Vercel Inc.', amount: '₹1.4L', span: 'col-start-4 col-span-3', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Paid (May 10)' },
                { name: 'Razorpay', amount: '₹88K', span: 'col-start-6 col-span-4', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Due in 5d (Jun 22)' },
                { name: 'Cred Pay', amount: '₹2.1L', span: 'col-start-5 col-span-3', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Overdue (May 28)' },
                { name: 'Graphy Design', amount: '₹45K', span: 'col-start-8 col-span-2', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Paid (Jun 12)' },
                { name: 'Groww Assets', amount: '₹1.2L', span: 'col-start-9 col-span-3', color: 'bg-white/5 text-[#888] border-white/10', label: 'Draft' }
              ].map(row => (
                <div key={row.name} className="grid grid-cols-12 items-center py-2 hover:bg-white/[0.01] transition-colors rounded px-2">
                  <div className="col-span-3 text-left font-sans font-medium text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    {row.name} <span className="text-[#555] font-mono text-[10px] font-normal">{row.amount}</span>
                  </div>
                  <div className="col-span-9 grid grid-cols-9 relative h-6">
                    <div className={`${row.span} ${row.color} border rounded flex items-center px-3 justify-between font-sans text-[10px] overflow-hidden truncate`}>
                      <span className="font-semibold truncate">{row.label}</span>
                      <span className="opacity-60">{row.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase Section 3: Clients & Accounts Triage ────────── */}
      <section id="compliance" className="py-24 px-6 border-t border-white/[0.05] bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          {/* Header Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-none">
                A unified view for clients and compliance.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-[15px] text-[#8a8b98] leading-relaxed">
                Organize buyer ledgers in one central interface. Validate company addresses and GSTIN codes with state codes. Generate instant summaries ready for GSTR-1 filings.
              </p>
            </div>
          </div>

          {/* Visual Showcase: Clients List & Details view */}
          <div className="rounded-xl border border-white/[0.06] bg-[#08080a] p-6 overflow-hidden relative shadow-[0_0_80px_rgba(94,106,210,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Clients Table Side */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                  <span className="text-xs font-semibold text-white">Active Clients</span>
                  <span className="text-[10px] text-[#555]">Total 14</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { name: 'Vercel Inc.', id: '27AAPCR1206M1Z8', revenue: '₹4.3L', due: '₹0', active: false },
                    { name: 'Razorpay Software', id: '29AAGCR8829C1Z0', revenue: '₹1.8L', due: '₹88,200', active: true },
                    { name: 'Cred Pay Solutions', id: '27AAICR9020M1Z2', revenue: '₹3.1L', due: '₹2,10,000', active: false },
                    { name: 'Graphy Design Ltd', id: '07AABCG4545M1ZN', revenue: '₹90,000', due: '₹0', active: false },
                  ].map(client => (
                    <div key={client.name} className={`flex items-center justify-between p-2.5 rounded border transition-colors cursor-pointer ${client.active ? 'bg-[#5e6ad2]/10 border-[#5e6ad2]/30 text-white' : 'bg-white/[0.01] border-white/[0.04] text-[#8a8b98] hover:bg-white/[0.02]'}`}>
                      <div>
                        <p className={`font-semibold ${client.active ? 'text-white' : 'text-white/80'}`}>{client.name}</p>
                        <p className="text-[9px] font-mono text-[#555]">{client.id}</p>
                      </div>
                      <div className="flex items-center gap-6 font-mono text-[11px]">
                        <div>
                          <p className="text-[9px] text-[#555] font-sans text-right">Revenue</p>
                          <p className="text-white/70">{client.revenue}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#555] font-sans text-right">Due</p>
                          <p className={client.due !== '₹0' ? 'text-orange-400 font-semibold' : 'text-[#555]'}>{client.due}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Profile Details Side */}
              <div className="lg:col-span-5 bg-white/[0.01] border border-white/[0.05] rounded-lg p-5 flex flex-col justify-between">
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="font-semibold text-white">Client Summary</span>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 rounded">Active Detail</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-[#555]">Full Business Name</p>
                      <p className="text-white font-medium">Razorpay Software Private Limited</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#555]">Registered Address</p>
                      <p className="text-[#a1a1aa] leading-relaxed">SJR Cyber, 22 Laskar Hosur Road, Adugodi, Bangalore, Karnataka, 560030</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-[#555]">GSTIN Type</p>
                        <p className="text-[#a1a1aa]">Regular Taxpayer</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#555]">Tax Rate Defaults</p>
                        <p className="text-[#a1a1aa]">18.00% IGST</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.04] mt-6 flex gap-2">
                  <button className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white text-[11px] py-1.5 rounded font-medium transition-colors">
                    Edit Details
                  </button>
                  <button className="flex-1 bg-white hover:bg-white/90 text-black text-[11px] py-1.5 rounded font-medium transition-colors">
                    View Invoices
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase Section 4: Revenue & Analytics ───────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          {/* Header Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-none">
                Analyze revenue and tax flows.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-[15px] text-[#8a8b98] leading-relaxed">
                Get a high-contrast visual display of client billings and tax liabilities. Keep track of CGST, SGST, and IGST portions to simplify quarterly filing reports.
              </p>
            </div>
          </div>

          {/* Visual Showcase: Analytics Chart */}
          <div className="rounded-xl border border-white/[0.06] bg-[#08080a] p-8 overflow-hidden relative shadow-[0_0_80px_rgba(94,106,210,0.08)]">
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.04] mb-8 text-xs text-[#555]">
              <span className="font-semibold text-white">Monthly Revenue & Tax Collections (FY 2025-26)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-6 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-sm" /> Net Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-6 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm" /> GST Collected</span>
              </div>
            </div>

            {/* Custom SVG/HTML Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-4 md:gap-8 font-mono text-[10px] text-[#444] border-b border-white/[0.04] pb-4">
              {[
                { month: 'Jan', revenue: 90, tax: 16 },
                { month: 'Feb', revenue: 110, tax: 20 },
                { month: 'Mar', revenue: 140, tax: 25 },
                { month: 'Apr', revenue: 120, tax: 22 },
                { month: 'May', revenue: 160, tax: 28 },
                { month: 'Jun', revenue: 195, tax: 35 },
              ].map((bar, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/[0.1] rounded px-2 py-1 absolute -translate-y-28 text-center text-white pointer-events-none">
                    <p className="font-semibold">Revenue: ₹{bar.revenue}K</p>
                    <p className="text-[9px] text-[#666]">GST: ₹{bar.tax}K</p>
                  </div>

                  {/* The Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Revenue Bar */}
                    <div
                      className="w-3 md:w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm group-hover:brightness-110 transition-all shadow-[0_0_15px_rgba(94,106,210,0.15)]"
                      style={{ height: `${(bar.revenue / 220) * 100}%` }}
                    />
                    {/* Tax Bar */}
                    <div
                      className="w-3 md:w-5 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm group-hover:brightness-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      style={{ height: `${(bar.tax / 220) * 100}%` }}
                    />
                  </div>
                  <span className="font-sans text-white/60 group-hover:text-white transition-colors">{bar.month}</span>
                </div>
              ))}
            </div>

            {/* Legend bottom row */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center">
              <div>
                <p className="text-[10px] text-[#555] uppercase font-bold">Total Net Revenue</p>
                <p className="text-white text-lg font-bold font-mono mt-1">₹8,15,000.00</p>
              </div>
              <div>
                <p className="text-[10px] text-[#555] uppercase font-bold">Total GST Collected</p>
                <p className="text-cyan-400 text-lg font-bold font-mono mt-1">₹1,46,700.00</p>
              </div>
              <div>
                <p className="text-[10px] text-[#555] uppercase font-bold">Pending Receivables</p>
                <p className="text-orange-400 text-lg font-bold font-mono mt-1">₹2,98,200.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Changelog Section ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-16">
            <span className="text-[11px] font-bold text-[#5e6ad2] uppercase tracking-wider block mb-3">Release Log</span>
            <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight leading-none">Changelog</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/[0.06] pt-12">
            {[
              { date: 'June 17, 2026', title: 'Interactive GSTIN verification checks', desc: 'Added a real-time checksum validation logic for Indian GSTIN codes. Instantly detects state mismatch and notifies the supplier before generating PDFs.' },
              { date: 'June 10, 2026', title: 'GSTR-1 JSON summaries and Excel downloads', desc: 'Generate and download fully compiled GSTR-1 quarterly/monthly summaries to send to your accountant or directly upload to the GST Portal.' },
              { date: 'June 01, 2026', title: 'Preloaded database of Indian HSN/SAC codes', desc: 'Over 40 preloaded HSN/SAC codes for software consultancies, e-commerce, architecture services, legal firms, and general retail. Keyboard shortcuts for fast selection.' },
              { date: 'May 18, 2026', title: 'Automated amount-in-words system conversion', desc: 'Automatically translates invoice totals to the standard Indian numbering system (Lakhs, Crores, Thousands) without manual configuration.' }
            ].map((change, idx) => (
              <div key={idx} className="space-y-2 p-6 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all">
                <span className="text-[10px] font-mono text-[#555] font-semibold">{change.date}</span>
                <h3 className="text-white text-[14px] font-semibold flex items-center gap-1.5">
                  {change.title} <ArrowUpRight size={12} className="text-[#555]" />
                </h3>
                <p className="text-[12px] text-[#8a8b98] leading-relaxed">{change.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two Large CTA Cards ────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-black z-10 relative">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lavender Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#1b1c30] to-[#0d0e17] p-10 flex flex-col justify-between min-h-[300px] group cursor-pointer hover:border-white/[0.15] transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5e6ad2]/15 rounded-full blur-[80px] group-hover:bg-[#5e6ad2]/20 transition-all pointer-events-none" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#9ba4e5] bg-[#5e6ad2]/20 px-2.5 py-1 rounded-full">Case Studies</span>
              <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight mt-6 leading-snug">
                See how modern Indian startups use TaxFlow to automate billing.
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#9ba4e5] font-semibold mt-8">
              <span>Read customer stories</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lime Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#1d1f14] to-[#0c0d08] p-10 flex flex-col justify-between min-h-[300px] group cursor-pointer hover:border-white/[0.15] transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e5fc42]/10 rounded-full blur-[80px] group-hover:bg-[#e5fc42]/15 transition-all pointer-events-none" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#e5fc42] bg-[#e5fc42]/10 px-2.5 py-1 rounded-full">Guides & Resources</span>
              <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight mt-6 leading-snug">
                Read our comprehensive guide to Indian GST invoicing compliance rules.
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#e5fc42] font-semibold mt-8">
              <span>Read compliance guides</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Banner ──────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center bg-black relative z-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[300px] bg-[#5e6ad2]/10 rounded-full blur-[140px]" />
        </div>
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-[44px] md:text-[64px] font-bold tracking-tight leading-none text-white gradient-text-hero">
            Built for the future.<br />Available today.
          </h2>
          <p className="text-[15px] text-[#8a8b98] leading-relaxed max-w-sm mx-auto">
            Join thousands of modern businesses managing GST-compliant invoicing in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="group bg-white hover:bg-white/90 text-black px-8 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                Go to Dashboard
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/login?mode=signup" className="group bg-white hover:bg-white/90 text-black px-8 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                  Sign up free
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/login" className="border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] text-white px-8 py-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all">
                  Log in to workspace
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-16 px-6 bg-black text-[#555] relative z-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="TaxFlow Logo" width={20} height={20} className="rounded object-contain" />
                <span className="text-[13px] font-semibold text-white tracking-tight">TaxFlow</span>
              </div>
              <p className="text-[12px] text-[#8a8b98] leading-relaxed max-w-[200px]">
                GST Invoicing system for modern Indian companies and freelancers.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Compliance', 'Integrations', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'GST Rate Finder', 'HSN Lookup', 'FAQ'] },
              { title: 'Company', links: ['About Us', 'Contact', 'Careers', 'Brand'] },
              { title: 'Developers', links: ['API docs', 'Status', 'GitHub', 'System'] },
            ].map((col, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2 text-[11px]">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 TaxFlow Technologies Private Limited. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-white">Security</Link>
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
