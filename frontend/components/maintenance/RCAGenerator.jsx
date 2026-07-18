'use client';

import React, { useState, useMemo } from 'react';
import { AlertCircle, Zap, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const typeIcons = {
  failure: <Zap size={12} className="text-[#ef4444]" />,
  alarm: <AlertCircle size={12} className="text-[#f59e0b]" />,
  inspection: <FileText size={12} className="text-blue-400" />,
  maintenance: <CheckCircle2 size={12} className="text-emerald-400" />,
  observation: <ShieldAlert size={12} className="text-purple-400" />,
};

export default function RCAGenerator({ events = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, []);

  return (
    <div className="ink-panel p-5 h-full overflow-y-auto grid-bg font-mono">
      <div className="flex items-center justify-between mb-5 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-[#ef4444]" />
          <div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
              Root Cause Analysis Timeline
            </h3>
            <p className="text-[9px] text-zinc-500 uppercase mt-0.5">
              Compressor K-301 Trip Event Chain
            </p>
          </div>
        </div>
        <StatusBadge status="resolved" label="Resolved" />
      </div>

      {/* Timeline nodes */}
      <div className="relative pl-6 border-l border-zinc-800 space-y-4">
        {sortedEvents.map((event) => {
          const isSelected = selectedEvent?.id === event.id;
          return (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(isSelected ? null : event)}
              className={`relative cursor-pointer transition-all border p-3 ${
                isSelected 
                  ? 'bg-[#111827] border-[#ef4444]/60' 
                  : 'bg-[#0d1117]/80 border-zinc-900 hover:border-zinc-800'
              }`}
            >
              {/* Bullet Node marker on timeline */}
              <span className="absolute -left-[30px] top-4 w-2 h-2 rounded-full bg-[#ef4444] border-2 border-[#0b0f19] shadow-[0_0_4px_var(--vermilion)]" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-zinc-100">{event.title}</span>
                    <StatusBadge status={event.severity} />
                    {event.isRootCause && (
                      <span className="text-[8px] font-bold bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] px-1 py-0.2 tracking-widest uppercase">
                        ROOT CAUSE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="text-right text-[9px] text-zinc-500">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Explanatory paths when node clicked */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-4 text-[9px] text-zinc-500 bg-[#0c0f19] p-3 border border-zinc-900">
                  <div>
                    <span className="text-zinc-600 block uppercase">TAG HANDLER</span>
                    <span className="text-zinc-300 font-bold">{event.assetId}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block uppercase">EQUIPMENT CATEGORY</span>
                    <span className="text-zinc-300 font-bold">{event.equipment}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
