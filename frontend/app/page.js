'use client';

import React from 'react';
import { Activity, ShieldAlert, Cpu, CheckSquare } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';

export default function ExecutiveOverview() {
  return (
    <div className="p-6 space-y-6 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase">
          Unified Asset & Operations Brain
        </h1>
        <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider">
          Enterprise AI Command Center • Real-Time Plant Analytics
        </p>
      </div>

      {/* KPI Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Overall Plant Uptime"
          value="--"
          unit="%"
          trendValue="--"
          trendIsPositive={true}
          iconName="Activity"
          sparkline={[]}
        />
        <MetricCard
          label="Active AI Hypotheses"
          value="--"
          unit="modes"
          trendValue="--"
          trendIsPositive={true}
          iconName="Brain"
          sparkline={[]}
        />
        <MetricCard
          label="Outstanding Audits"
          value="--"
          unit="tasks"
          trendValue="--"
          trendIsPositive={true}
          iconName="ClipboardCheck"
          sparkline={[]}
        />
        <MetricCard
          label="Critical Gaps"
          value="--"
          unit="alerts"
          trendValue="--"
          trendIsPositive={false}
          iconName="ShieldAlert"
          sparkline={[]}
        />
      </div>

      {/* Operational heat map & modules mapping grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Plant State & Top Sensors */}
        <div className="xl:col-span-2 ink-panel p-5 grid-bg">
          <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase mb-4 flex items-center gap-2">
            <Cpu size={14} className="text-[#ef4444]" />
            Plant Core Health Grid
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[].map((node, i) => (
              <div key={i}></div>
            ))}
          </div>
        </div>

        {/* Right: Live Diagnostics Feed */}
        <div className="ink-panel p-5 grid-bg flex flex-col h-full">
          <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase mb-4 flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#ef4444]" />
            AI Operations Log
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[260px] pr-2">
            {[].map((log, idx) => (
              <div key={idx}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
