'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Wrench,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Activity,
  Layers,
  Database,
  UserCheck
} from 'lucide-react';

const navItems = [
  {
    to: '/',
    label: 'Executive Overview',
    sublabel: 'Plant Command Center',
    icon: Layers,
  },
  {
    to: '/copilot',
    label: 'Expert Knowledge Copilot',
    sublabel: 'RAG AI Assistant',
    icon: Brain,
  },
  {
    to: '/maintenance',
    label: 'Maintenance & RCA',
    sublabel: 'Predictive & Root Cause',
    icon: Wrench,
  },
  {
    to: '/compliance',
    label: 'Quality & Compliance',
    sublabel: 'Safety Regulations',
    icon: ShieldCheck,
  },
];

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        flex flex-col h-screen bg-[#0d1117] border-r border-[#1f2937]
        transition-all duration-300 ease-in-out flex-shrink-0 relative
        ${isExpanded ? 'w-[260px]' : 'w-[72px]'}
      `}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#1f2937] flex-shrink-0 bg-[#0d1117] overflow-hidden">
        <div className="w-8 h-8 rounded-none bg-[#ef4444] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_var(--vermilion)]">
          <Activity size={18} className="text-zinc-950 font-bold" />
        </div>
        {isExpanded && (
          <div className="animate-fade-in whitespace-nowrap">
            <h1 className="text-xs font-mono font-bold text-zinc-100 tracking-wider uppercase leading-none">
              INTELLIPLANT
            </h1>
            <p className="text-[9px] font-mono text-zinc-500 font-bold tracking-widest uppercase mt-1">
              OPERATIONS BRAIN
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p
          className={`
            text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2
            ${isExpanded ? 'px-3' : 'text-center'}
          `}
        >
          {isExpanded ? 'CONTROL CONSOLE' : '---'}
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`
                group relative flex items-center gap-3 rounded-none transition-all duration-150 font-mono
                ${isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                ${
                  isActive
                    ? 'bg-[#111827] text-[#ef4444] border-l border-l-[#ef4444]'
                    : 'text-zinc-400 hover:bg-[#111827]/60 hover:text-zinc-100'
                }
              `}
            >
              <span
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#ef4444]' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              >
                <Icon size={18} className="stroke-[1.5]" />
              </span>
              
              {isExpanded && (
                <div className="min-w-0">
                  <p className="text-[12px] font-bold tracking-wide truncate leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[9px] text-zinc-500 truncate mt-0.5 group-hover:text-zinc-400">
                    {item.sublabel}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Indicators at Bottom */}
      <div className="border-t border-[#1f2937] p-3 space-y-1 flex-shrink-0 bg-[#0d1117]">
        {isExpanded ? (
          <div className="px-2 py-1.5 bg-[#111827] border border-[#1f2937] rounded-none mb-3 font-mono">
            <div className="flex items-center justify-between text-[9px] text-zinc-500">
              <span>DB SYNC STATE</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1">
              <span>RAG ENGINE</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <Database size={12} className="text-emerald-400 animate-pulse" />
          </div>
        )}

        {/* User Card */}
        <div
          className={`
            flex items-center gap-3 rounded-none bg-[#111827] border border-[#1f2937]
            ${isExpanded ? 'px-3 py-2' : 'justify-center py-2'}
          `}
        >
          <div className="w-8 h-8 rounded-none bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold text-zinc-100">
            RP
          </div>
          {isExpanded && (
            <div className="min-w-0 font-mono">
              <p className="text-[11px] font-bold text-zinc-200 truncate leading-none">
                Rajesh Patel
              </p>
              <p className="text-[9px] text-zinc-500 truncate mt-1 uppercase tracking-wider">
                Reliability Eng
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-none bg-[#0d1117] border border-[#1f2937] flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-[#111827] transition-all duration-150 z-20 shadow-lg cursor-pointer"
        aria-label={isExpanded ? 'Collapse console' : 'Expand console'}
      >
        {isExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
