'use client';

import React from 'react';
import { Activity, ShieldAlert, Thermometer, ShieldCheck } from 'lucide-react';

export default function TelemetryTicker({ metrics = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-[#ef4444] border-l-[#ef4444] bg-[#ef4444]/5';
      case 'warning': return 'text-[#f59e0b] border-l-[#f59e0b] bg-[#f59e0b]/5';
      default: return 'text-emerald-400 border-l-emerald-500 bg-emerald-950/5';
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 px-3 border-b border-[#1f2937] bg-[#0d1117] flex-shrink-0">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`flex items-center gap-2 px-3 py-1 border border-[#1f2937] border-l-2 text-[10px] font-mono flex-shrink-0 ${getStatusColor(
            metric.status
          )}`}
        >
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase leading-none">{metric.unit}</span>
            <span className="text-zinc-300 font-bold mt-1">{metric.label}</span>
          </div>
          <span className="font-bold text-[12px] ml-1 tracking-tighter">{metric.value}</span>
        </div>
      ))}
    </div>
  );
}
