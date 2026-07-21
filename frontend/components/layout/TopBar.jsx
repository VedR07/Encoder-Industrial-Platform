'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Brain,
  Wrench,
  ShieldCheck,
  Factory,
  Cpu,
  MemoryStick,
  Share2,
  FileImage,
  Server,
  Globe2,
  Box,
  HardHat,
} from 'lucide-react';

const megaMenuItems = [
  {
    to: '/',
    label: 'Executive Overview',
    description: 'Global plant metrics, uptime status, and critical KPIs for senior leadership.',
    icon: LayoutDashboard,
  },
  {
    to: '/chat',
    label: 'AI Chat',
    description: 'Unified multi-agent chat interface with RCA, Compliance, and Copilot assistants.',
    icon: Brain,
  },
  {
    to: '/graph',
    label: 'Graph Explorer',
    description: 'Visualize asset relationships, dependencies, and complex process flow topologies.',
    icon: Share2,
  },
  {
    to: '/pid',
    label: 'P&ID Vision Parser',
    description: 'Upload engineering drawings — AI extracts equipment tags, instruments, and piping connections live.',
    icon: FileImage,
  },
  {
    to: '/integrations',
    label: 'Enterprise Integrations',
    description: 'Connect existing ERP, EAM, and SCADA systems (SAP, Maximo, MindSphere) via zero-ETL.',
    icon: Server,
  },
  {
    to: '/insights',
    label: 'Cross-Plant Insights',
    description: 'Global lessons learned engine. See how AI predicts systemic failures across the enterprise fleet.',
    icon: Globe2,
  },
  {
    to: '/twin',
    label: '2.5D Digital Twin',
    description: 'Interactive schematic view with live telemetry overlays and time-scrub fault playback.',
    icon: Box,
  },
  {
    to: '/field',
    label: 'Field Technician Mode',
    description: 'Hands-free, high-contrast AR interface for mechanics on the factory floor. Push-to-Talk AI lookup.',
    icon: HardHat,
  },
];

export default function TopBar({ viewMode, setViewMode, activeAsset }) {
  const pathname = usePathname();

  const activePage = megaMenuItems.find(
    (item) => item.to === pathname
  ) || megaMenuItems[0];

  return (
    <header className="fixed top-0 left-0 w-full h-14 z-50 bg-white border-b border-[#e2e8f0] nav-group">
      <div className="h-14 px-6 flex justify-between items-center relative z-[60] bg-white">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8 h-full">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#2563eb] flex items-center justify-center">
              <Factory size={16} className="text-white" />
            </div>
            <h1 className="text-[15px] font-bold tracking-tight text-[#1e293b]" style={{ fontFamily: 'Inter, sans-serif' }}>
              INTELLIPLANT
            </h1>
          </div>

          {/* Nav trigger + breadcrumb */}
          <nav className="flex h-full items-center ml-2 border-l border-[#e2e8f0] pl-6">
            {/* Mega menu trigger */}
            <div className="h-full flex items-center">
              <div className="flex items-center gap-1.5 cursor-pointer px-3 h-full border-b-2 border-transparent hover:border-[#2563eb] transition-all">
                <span className="text-[#1e293b] font-bold text-[11px] uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Operations
                </span>
                <ChevronDown size={12} className="text-[#64748b] transition-transform" />
              </div>
            </div>

            <div className="h-full flex items-center border-b-2 border-transparent ml-3">
              <span className="text-[#64748b] px-3 text-[11px] uppercase tracking-tight" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {activeAsset ? activeAsset.label : ''}
              </span>
            </div>
          </nav>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-48">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              className="w-full bg-slate-50 border border-[#e2e8f0] py-1.5 pl-8 pr-4 text-[11px] focus:border-[#2563eb] focus:ring-0 outline-none transition-all"
              placeholder="Search Assets..."
              type="text"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 border-r border-[#e2e8f0] pr-3">
            <button className="text-[#64748b] hover:text-[#2563eb] transition-colors">
              <Settings size={18} />
            </button>
            <div className="relative cursor-pointer">
              <Bell size={18} className="text-[#64748b]" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#ef4444] animate-subtle-pulse" />
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 pl-1">
            <div className="text-right">
              <p className="text-[11px] font-bold text-[#1e293b] leading-tight" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                User
              </p>
              <p className="text-[9px] text-[#64748b] uppercase tracking-tighter" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Chief Engineer
              </p>
            </div>
            <div className="w-8 h-8 border border-[#e2e8f0] bg-[#dbeafe] text-[#1e40af] flex items-center justify-center text-[11px] font-bold">
              U
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      <div className="mega-menu absolute top-full left-0 w-full bg-white border-b border-[#e2e8f0] shadow-xl z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-stretch divide-x divide-[#e2e8f0]">
          {megaMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex-1 px-6 py-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors relative ${
                  isActive ? 'bg-slate-50' : ''
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#2563eb]" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={isActive ? 'text-[#2563eb]' : 'text-[#64748b]'}
                  />
                  <span
                    className="text-[11px] font-bold text-[#1e293b] uppercase tracking-wide"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    {item.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#64748b] leading-normal">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Status footer */}
        <div className="bg-slate-50 border-t border-[#e2e8f0] px-6 py-2 flex items-center gap-8 justify-end">
          <div className="flex items-center gap-1.5">
            <Cpu size={10} className="text-[#2563eb]" />
            <span className="text-[10px] uppercase font-bold text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Database: <span className="text-[#2563eb]">LIVE</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MemoryStick size={10} className="text-[#2563eb]" />
            <span className="text-[10px] uppercase font-bold text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              RAG Engine: <span className="text-[#2563eb]">NOMINAL</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
