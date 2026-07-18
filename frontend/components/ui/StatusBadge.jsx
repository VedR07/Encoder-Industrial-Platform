import React from 'react';

const statusConfig = {
  // Severities / Priorities
  critical: { bg: 'bg-red-950/40', text: 'text-red-400', dot: 'bg-red-500', border: 'border-red-900/60' },
  high: { bg: 'bg-orange-950/40', text: 'text-orange-400', dot: 'bg-orange-500', border: 'border-orange-900/60' },
  medium: { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-500', border: 'border-amber-900/60' },
  low: { bg: 'bg-blue-950/40', text: 'text-blue-400', dot: 'bg-blue-500', border: 'border-blue-900/60' },
  warning: { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-500', border: 'border-amber-900/60' },
  alert: { bg: 'bg-orange-950/40', text: 'text-orange-400', dot: 'bg-orange-500', border: 'border-orange-900/60' },
  
  // States
  open: { bg: 'bg-blue-950/40', text: 'text-blue-400', dot: 'bg-blue-500', border: 'border-blue-900/60' },
  'in progress': { bg: 'bg-purple-950/40', text: 'text-purple-400', dot: 'bg-purple-500', border: 'border-purple-900/60' },
  completed: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-900/60' },
  resolved: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-900/60' },
  operational: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-900/60' },
  maintenance: { bg: 'bg-blue-950/40', text: 'text-blue-400', dot: 'bg-blue-500', border: 'border-blue-900/60' },
  draft: { bg: 'bg-slate-900/60', text: 'text-slate-400', dot: 'bg-slate-500', border: 'border-slate-800' },
  'in review': { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-500', border: 'border-amber-900/60' },
  approved: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-900/60' },
  exported: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', dot: 'bg-cyan-500', border: 'border-cyan-900/60' },
  
  // Compliance score statuses
  compliant: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-900/60' },
  'gap detected': { bg: 'bg-red-950/40', text: 'text-red-400', dot: 'bg-red-500', border: 'border-red-900/60' },
  'at risk': { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-500', border: 'border-amber-900/60' }
};

export default function StatusBadge({ status, label, size = 'sm' }) {
  const normStatus = status ? status.toLowerCase() : 'draft';
  const config = statusConfig[normStatus] || statusConfig['draft'];
  const isSmall = size === 'sm';

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-sm border
        ${config.bg} ${config.text} ${config.border}
        ${isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'}
        font-mono uppercase tracking-wider
      `}
    >
      <span className={`w-1 h-1 rounded-full ${config.dot} shadow-[0_0_4px_currentColor]`} />
      <span>{label || status}</span>
    </div>
  );
}
