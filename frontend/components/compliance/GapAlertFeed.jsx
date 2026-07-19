'use client';

import React from 'react';
import { AlertCircle, Terminal, HardHat } from 'lucide-react';
import { mockGapAlerts } from '../../data/complianceData';
import StatusBadge from '../ui/StatusBadge';

export default function GapAlertFeed() {
  return (
    <div className="ink-panel p-5 grid-bg font-mono flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
        <AlertCircle size={14} className="text-[#ef4444]" />
        <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
          Regulatory Gap Alerts
        </h3>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
        {mockGapAlerts.map((gap) => (
          <div
            key={gap.id}
            className="border border-zinc-900 bg-[#0d1117]/80 hover:border-zinc-800 p-2.5 flex flex-col gap-1.5 text-[10px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[#ef4444] font-bold">{gap.standard}</span>
                <span className="text-zinc-600 font-semibold">{gap.clauseRef}</span>
              </div>
              <StatusBadge status={gap.severity} />
            </div>

            <p className="text-zinc-300 font-sans leading-relaxed text-[11px]">
              {gap.description}
            </p>

            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1 border-t border-zinc-900/60 mt-1">
              <span>Area: {gap.affectedArea}</span>
              {gap.assignedTo && <span className="text-zinc-400">Assigned: {gap.assignedTo}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
