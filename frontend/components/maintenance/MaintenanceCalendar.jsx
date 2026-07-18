'use client';

import React from 'react';
import { Calendar as CalendarIcon, Clock, HardHat } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function MaintenanceCalendar({ schedule = [] }) {
  return (
    <div className="ink-panel p-5 grid-bg font-mono flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
        <CalendarIcon size={14} className="text-[#ef4444]" />
        <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
          Optimised Maintenance Schedule
        </h3>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
        {schedule.map((item) => (
          <div
            key={item.id}
            className="border border-zinc-900 bg-[#0d1117]/80 hover:border-zinc-800 p-2.5 flex items-center justify-between text-[10px]"
          >
            <div className="flex items-center gap-3">
              {/* Date Box */}
              <div className="bg-[#111827] border border-zinc-800 p-1 text-center min-w-[50px]">
                <span className="text-[11px] font-bold text-zinc-200 block leading-none">
                  {new Date(item.date).toLocaleDateString('en-US', { day: '2-digit' })}
                </span>
                <span className="text-[7px] text-zinc-500 uppercase mt-0.5 block tracking-widest">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>

              <div>
                <span className="text-zinc-100 font-bold block">{item.title}</span>
                <span className="text-zinc-500 text-[9px] uppercase mt-0.5 block">
                  Equipment: {item.equipment}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={item.priority} label={item.priority} />
              <span className="bg-[#111827] border border-zinc-800 px-1.5 py-0.5 text-zinc-400 text-[8px] uppercase tracking-wider">
                {item.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
