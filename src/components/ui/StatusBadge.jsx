import React from 'react';

/**
 * Reusable Status Badge Component.
 * 
 * Props:
 * - status (string): 'draft', 'sent', 'paid', 'overdue', 'cancelled'
 */
export default function StatusBadge({ status = 'draft' }) {
  const normalizedStatus = String(status).toLowerCase();

  const statusConfigs = {
    draft: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    sent: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    overdue: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    cancelled: 'bg-slate-700/15 text-slate-500 border border-slate-700/30',
  };

  const currentConfig = statusConfigs[normalizedStatus] || statusConfigs.draft;
  const capitalizedLabel = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border select-none ${currentConfig}`}
    >
      {capitalizedLabel}
    </span>
  );
}
