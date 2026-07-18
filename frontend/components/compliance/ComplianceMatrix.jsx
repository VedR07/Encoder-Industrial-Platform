'use client';

import React, { useState } from 'react';
import StatusBadge from '../ui/StatusBadge';
import { ShieldCheck, Flame, Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

const standardIcons = {
  'STD-001': <Scale size={16} className="text-[#ef4444]" />,
  'STD-002': <Flame size={16} className="text-[#f59e0b]" />,
  'STD-003': <ShieldCheck size={16} className="text-emerald-400" />,
  'STD-004': <ShieldCheck size={16} className="text-blue-400" />,
  'STD-005': <CheckCircle2 size={16} className="text-purple-400" />,
};

export default function ComplianceMatrix({ standards = [] }) {
  const [selectedStandard, setSelectedStandard] = useState(standards[0] || null);

  if (!selectedStandard) {
    return (
      <div className="ink-panel p-5 grid-bg font-mono flex items-center justify-center text-zinc-500 text-xs min-h-[200px]">
        No compliance standards available.
      </div>
    );
  }

  return (
    <div className="ink-panel p-5 grid-bg font-mono flex flex-col md:flex-row gap-6">
      {/* Left List of Standards */}
      <div className="flex-1 space-y-2">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-3 border-b border-zinc-900 pb-2 flex items-center gap-2">
          Regulatory Code Scoreboard
        </h3>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {standards.map((std) => {
            const isSelected = selectedStandard.id === std.id;
            return (
              <div
                key={std.id}
                onClick={() => setSelectedStandard(std)}
                className={`border p-2.5 flex items-center justify-between text-[11px] cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#111827] border-[#ef4444]'
                    : 'bg-[#0d1117]/80 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {standardIcons[std.id] || <ShieldCheck size={16} />}
                  <div className="truncate">
                    <span className="text-zinc-100 font-bold block truncate">{std.shortName}</span>
                    <span className="text-[8px] text-zinc-500 block truncate">{std.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={std.status} />
                  <span className="text-zinc-100 font-bold bg-zinc-950 px-1.5 py-0.5 border border-zinc-800">
                    {std.overallScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Category breakdowns */}
      <div className="flex-1 bg-[#0c0f19] border border-zinc-900 p-4 flex flex-col justify-between">
        <div>
          <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-3">
            {selectedStandard.shortName} Category Scoreboard
          </h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {selectedStandard.categories.map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] py-1 border-b border-zinc-900/40">
                <span className="text-zinc-300 font-sans">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    cat.status === 'pass' ? 'bg-emerald-500' : 'bg-[#f59e0b]'
                  }`} />
                  <span className="text-zinc-100 font-bold">{cat.score}/{cat.maxScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-3 mt-3 text-[9px] text-zinc-500 uppercase flex justify-between">
          <span>Last Audit: {selectedStandard.lastAuditDate}</span>
          <span className="text-[#ef4444]">Next: {selectedStandard.nextDueDate}</span>
        </div>
      </div>
    </div>
  );
}
