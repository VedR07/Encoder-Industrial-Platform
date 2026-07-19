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
        flex flex-col h-screen bg-[#1e293b] border-r border-[#334155]
        transition-all duration-300 ease-in-out flex-shrink-0 relative
        ${isExpanded ? 'w-[260px]' : 'w-[72px]'}
      `}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#334155] flex-shrink-0 bg-[#1e293b] overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-[#0d7377] flex items-center justify-center flex-shrink-0 shadow-md">
          <Activity size={18} className="text-white font-bold" />
        </div>
        {isExpanded && (
          <div className="animate-fade-in whitespace-nowrap">
            <h1 className="text-[13px] font-semibold text-white tracking-wide leading-none">
              IntelliPlant
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 tracking-wide">
              Operations Brain
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p
          className={`
            text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2
            ${isExpanded ? 'px-3' : 'text-center'}
          `}
        >
          {isExpanded ? 'Control Console' : '—'}
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`
                group relative flex items-center gap-3 rounded-lg transition-all duration-150
                ${isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                ${
                  isActive
                    ? 'bg-[#0d7377]/20 text-[#14b8a6] border-l-2 border-l-[#14b8a6]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }
              `}
            >
              <span
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#14b8a6]' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                <Icon size={18} className="stroke-[1.5]" />
              </span>
              
              {isExpanded && (
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold tracking-wide truncate leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 group-hover:text-slate-400">
                    {item.sublabel}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Indicators at Bottom */}
      <div className="border-t border-[#334155] p-3 space-y-1 flex-shrink-0 bg-[#1e293b]">
        {isExpanded ? (
          <div className="px-2 py-1.5 bg-[#0f172a] border border-[#334155] rounded-lg mb-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>DB Sync State</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-subtle-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>RAG Engine</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <Database size={12} className="text-emerald-400 animate-subtle-pulse" />
          </div>
        )}

        {/* User Card */}
        <div
          className={`
            flex items-center gap-3 rounded-lg bg-[#0f172a] border border-[#334155]
            ${isExpanded ? 'px-3 py-2' : 'justify-center py-2'}
          `}
        >
          <div className="w-8 h-8 rounded-lg bg-[#0d7377] flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white">
            RP
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate leading-none">
                Rajesh Patel
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-1 tracking-wide">
                Reliability Eng
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-[#e2e0dc] flex items-center justify-center text-slate-400 hover:text-[#0d7377] hover:border-[#0d7377] transition-all duration-150 z-20 shadow-md cursor-pointer"
        aria-label={isExpanded ? 'Collapse console' : 'Expand console'}
      >
        {isExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
