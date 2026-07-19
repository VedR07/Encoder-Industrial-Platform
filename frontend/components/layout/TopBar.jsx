'use client';

import React from 'react';
import { Search, Bell, Monitor, Smartphone, Cpu } from 'lucide-react';

export default function TopBar({ viewMode, setViewMode, activeAsset }) {
  return (
    <header className="h-14 border-b border-[#1f2937] bg-[#0d1117]/90 px-4 flex items-center justify-between flex-shrink-0 font-mono">
      {/* Active Breadcrumb / Status */}
      <div className="flex items-center gap-2">
        <Cpu size={14} className="text-[#ef4444]" />
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="text-zinc-600">SYS://</span>
          <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Refinery-Alpha</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-100 font-bold">
            {activeAsset ? activeAsset.label : 'Global Plant Monitor'}
          </span>
          {activeAsset?.assetTag && (
            <span className="bg-zinc-900 border border-zinc-800 text-[9px] text-[#f59e0b] px-1 py-0.2 ml-1">
              {activeAsset.assetTag}
            </span>
          )}
        </div>
      </div>

      {/* Global Lookup Lookup and Action Center */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search telemetry registry..."
            className="w-56 bg-[#111827] border border-[#1f2937] text-[10px] pl-8 pr-3 py-1 text-zinc-300 placeholder-zinc-600 rounded-none focus:outline-none focus:border-[#ef4444] transition-colors"
          />
        </div>

        {/* View mode toggle chips */}
        <div className="flex items-center bg-[#111827] border border-[#1f2937] p-0.5">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-2 py-0.5 flex items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-[#ef4444] text-zinc-950 shadow-[0_0_6px_var(--vermilion)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Monitor size={10} />
            <span>Engineer View</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-2 py-0.5 flex items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-[#ef4444] text-zinc-950 shadow-[0_0_6px_var(--vermilion)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Smartphone size={10} />
            <span>Field Tech</span>
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer w-7 h-7 flex items-center justify-center border border-[#1f2937] hover:border-[#ef4444] transition-colors bg-[#111827]">
          <Bell size={12} className="text-zinc-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ef4444] rounded-full border border-[#0d1117] shadow-[0_0_4px_var(--vermilion)] animate-pulse" />
        </div>
      </div>
    </header>
  );
}
