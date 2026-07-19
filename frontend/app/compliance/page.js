'use client';

import React from 'react';
import {
  Shield,
  Factory,
  Flame,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  FolderOpen,
  Home,
  Plus,
} from 'lucide-react';

const scoreboards = [
  {
    label: 'FACTORY ACT',
    sublabel: 'Safety Standards',
    icon: Factory,
    score: 98,
    barColor: 'bg-green-500',
    status: 'STATUS: OPTIMAL',
    statusColor: 'text-slate-400',
    time: '12H AGO',
  },
  {
    label: 'OISD',
    sublabel: 'Oil Industry Safety',
    icon: Flame,
    score: 87,
    barColor: 'bg-amber-500',
    status: 'STATUS: ATTENTION',
    statusColor: 'text-amber-600',
    time: '2D AGO',
  },
  {
    label: 'PESO',
    sublabel: 'Explosives Safety',
    icon: AlertTriangle,
    score: 92,
    barColor: 'bg-[#2563eb]',
    status: 'STATUS: STABLE',
    statusColor: 'text-slate-400',
    time: '4H AGO',
  },
];

const dossierData = [
  {
    id: 'DOS-OISD-2023-094',
    standard: 'OISD-150',
    entity: 'Flare Header System',
    artifacts: ['PDF', 'XLS'],
    extra: '+2',
    status: 'PENDING',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'DOS-PESO-2023-112',
    standard: 'PESO-SMPV',
    entity: 'Hydrogen Storage',
    artifacts: ['CAD', 'IMG'],
    extra: null,
    status: 'VERIFIED',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'DOS-FACT-2024-001',
    standard: 'FAC-ACT-CH4',
    entity: 'Ventilation Unit 08',
    artifacts: ['DOC'],
    extra: null,
    status: 'REJECTED',
    statusColor: 'bg-red-50 text-red-700 border-red-200',
  },
];

const gaps = [
  {
    label: 'OISD Non-Compliance',
    labelColor: 'text-red-500',
    time: '02:45 AM',
    text: 'Interlock safety logic bypassed on Unit 04 Flare Header. Immediate verification required.',
  },
  {
    label: 'PESO Expiring',
    labelColor: 'text-amber-600',
    time: '08:12 AM',
    text: 'Hydro-test certification for Tank T-402 expires in 14 days.',
  },
];

export default function CompliancePage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8 flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <nav className="flex items-center gap-1 text-[11px] text-[#2563eb] font-bold uppercase tracking-widest mb-1">
              <Shield size={13} />
              Operational Compliance
            </nav>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Quality & Compliance
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Industrial Unit-04 Dashboard • <span className="font-medium text-slate-700">Refinery Alpha</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  System Health
                </span>
                <span className="text-2xl font-bold text-[#2563eb]">94.2%</span>
              </div>
              <div className="w-48 h-2 bg-slate-200 relative">
                <div className="absolute inset-0 bg-[#2563eb]" style={{ width: '94.2%' }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-[#2563eb] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Start Audit
              </button>
              <button className="bg-white border border-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {scoreboards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {s.label}
                    </h3>
                    <p className="text-sm font-semibold text-slate-700">{s.sublabel}</p>
                  </div>
                  <Icon size={20} className="text-slate-300" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {s.score}<span className="text-lg text-slate-400">%</span>
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 mb-2">
                    <div className={`${s.barColor} h-full`} style={{ width: `${s.score}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold border-t border-slate-50 pt-2"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <span className={s.statusColor}>{s.status}</span>
                  <span className="text-slate-400">{s.time}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Dossier + Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Evidence Dossier Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <FolderOpen size={18} className="text-[#2563eb]" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Evidence Packages Dossier</h3>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#2563eb] hover:bg-blue-50 px-3 py-1 transition-colors uppercase border border-blue-100"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                <Upload size={12} /> Upload Documents
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    <th className="px-4 py-3 border-r border-slate-50">Dossier ID</th>
                    <th className="px-4 py-3 border-r border-slate-50">Standard</th>
                    <th className="px-4 py-3 border-r border-slate-50">Subject Entity</th>
                    <th className="px-4 py-3 border-r border-slate-50">Artifacts</th>
                    <th className="px-4 py-3 border-r border-slate-50">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {dossierData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-[11px] text-slate-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {row.id}
                      </td>
                      <td className="px-4 py-4 font-semibold">{row.standard}</td>
                      <td className="px-4 py-4">{row.entity}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {row.artifacts.map((a, j) => (
                            <span key={j} className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold border border-slate-200">{a}</span>
                          ))}
                          {row.extra && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-[#2563eb] text-[9px] font-bold border border-blue-100">{row.extra}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-slate-300 hover:text-[#2563eb] transition-colors">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <span>Showing 1-3 of 24 Packages</span>
              <div className="flex border border-slate-200 bg-white">
                <button className="px-2 py-1 hover:bg-slate-50 border-r border-slate-200">
                  <ChevronLeft size={12} />
                </button>
                <button className="px-2 py-1 hover:bg-slate-50">
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Gaps + Runtime */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Regulatory Gaps */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <Home size={16} className="text-amber-500" />
                  Regulatory Gaps
                </h3>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase border border-red-100">3 Priority</span>
              </div>
              <div className="divide-y divide-slate-100">
                {gaps.map((g, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex justify-between mb-1">
                      <span className={`text-[10px] font-bold ${g.labelColor} uppercase`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {g.label}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {g.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">{g.text}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-[#2563eb] transition-colors border-t border-slate-100 uppercase tracking-widest"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                View Audit Log
              </button>
            </div>

            {/* Quality Engine Runtime */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm border-t-2 border-t-[#2563eb]">
              <h4 className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest mb-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Quality Engine Runtime
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    <span>LATENCY</span>
                    <span className="text-slate-900">24ms</span>
                  </div>
                  <div className="h-1 bg-slate-100">
                    <div className="h-full bg-[#2563eb] w-1/4" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    <span>ACCURACY</span>
                    <span className="text-slate-900">99.8%</span>
                  </div>
                  <div className="h-1 bg-slate-100">
                    <div className="h-full bg-blue-500" style={{ width: '99%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#2563eb] text-white shadow-lg flex items-center justify-center transition-all hover:bg-blue-700 active:scale-95 z-50">
        <Plus size={20} />
      </button>
    </div>
  );
}
