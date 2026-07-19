'use client';

import React from 'react';
import {
  Zap,
  Search,
  AlertTriangle,
  Timer,
  Wrench as WrenchIcon,
  AlertOctagon,
  HeartPulse,
  Share2,
  RefreshCw,
  Calendar,
  Link,
  Activity,
  User,
  Clock,
  History,
  Plus,
  Play,
  Settings,
  FileText,
  Cpu,
  Drum,
  Target,
  Terminal,
} from 'lucide-react';

const metricsData = [
  { label: 'MTBF', value: '412.5 hrs', trend: '↑ +12% VS LAST CYCLE', trendColor: 'text-green-600', icon: Timer },
  { label: 'MTTR', value: '2.8 hrs', trend: '↓ -4% EFFICIENCY LOSS', trendColor: 'text-red-500', icon: WrenchIcon },
  { label: 'PREDICTED FAILURES', value: '03', trend: '92% CONFIDENCE', trendColor: 'text-[#64748b]', icon: AlertOctagon, valueColor: 'text-red-600' },
  { label: 'SYSTEM HEALTH', value: '98.2%', progress: 98.2, icon: HeartPulse },
];

export default function MaintenancePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-[#2563eb] font-medium mb-1 uppercase tracking-wider">
              <Settings size={13} />
              Operational Intelligence
            </nav>
            <h2 className="text-2xl font-semibold text-[#1e293b] tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Maintenance & Root Cause Analysis
            </h2>
            <p className="text-[#64748b] text-sm">
              Structured event analysis → predictive modeling → human review
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#2563eb] text-white px-6 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <Zap size={14} /> START GOLDEN DEMO
            </button>
            <button className="border border-[#cbd5e1] bg-white px-6 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <Play size={14} /> BUILD FROM DATA
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="bg-white border border-[#e2e8f0] p-6 flex items-center justify-between group hover:border-[#2563eb] transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {m.label}
                  </p>
                  <div className={`text-xl font-semibold ${m.valueColor || 'text-[#1e293b]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {m.value}
                  </div>
                  {m.trend && (
                    <p className={`text-[10px] font-bold mt-1 ${m.trendColor}`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {m.trend}
                    </p>
                  )}
                  {m.progress && (
                    <div className="w-32 bg-slate-100 h-1.5 mt-2">
                      <div className="h-full bg-[#2563eb]" style={{ width: `${m.progress}%` }} />
                    </div>
                  )}
                </div>
                <Icon size={28} className="text-[#2563eb]/20 group-hover:text-[#2563eb] transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Main Panels: RCA Timeline + Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RCA Timeline (2/3) */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] flex flex-col">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Activity size={14} className="text-[#2563eb]" />
                Root Cause Analysis Timeline: <span className="text-[#64748b] font-normal">#RCA-902</span>
              </h3>
              <div className="flex gap-1.5">
                <button className="p-1 hover:bg-slate-200 transition-colors">
                  <Share2 size={14} className="text-[#64748b]" />
                </button>
                <button className="p-1 hover:bg-slate-200 transition-colors">
                  <RefreshCw size={14} className="text-[#64748b]" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* T-0 Incident */}
              <div className="relative flex gap-6">
                <div className="timeline-connector" />
                <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0 z-10 border border-red-200">
                  <Zap size={18} className="text-red-600" />
                </div>
                <div className="flex-1 bg-red-50/30 border border-red-100 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">T-0 Incident</span>
                    <span className="text-[10px] text-[#64748b] font-mono">14:22:10 UTC</span>
                  </div>
                  <h4 className="font-bold text-[#1e293b] mb-1">Critical Thermal Spike: Turbine Alpha-4</h4>
                  <p className="text-sm text-[#64748b]">
                    Sensor detects 4.2mm/s displacement on Axial Bearing. Temperature surged to 92°C in &lt; 4 seconds.
                  </p>
                </div>
              </div>

              {/* T+15s Agent Analysis */}
              <div className="relative flex gap-6">
                <div className="timeline-connector" />
                <div className="w-10 h-10 bg-blue-50 flex items-center justify-center shrink-0 z-10 border border-blue-200">
                  <Search size={18} className="text-[#2563eb]" />
                </div>
                <div className="flex-1 border border-[#e2e8f0] p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest">T+15s Agent Analysis</span>
                    <span className="text-[10px] text-[#64748b] font-mono">14:22:25 UTC</span>
                  </div>
                  <h4 className="font-bold text-[#1e293b] mb-1">Lubricant Viscosity Drop Identified</h4>
                  <p className="text-sm text-[#64748b]">
                    Agent correlates feed-line pressure drop from Sub-system B with thermal event. Filter blockage highly probable.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[9px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 uppercase border border-blue-100">Match: 94%</span>
                    <span className="text-[9px] font-bold text-[#64748b] bg-slate-100 px-2 py-0.5 uppercase">Sensors: 4/5</span>
                  </div>
                </div>
              </div>

              {/* T+45s Root Cause */}
              <div className="relative flex gap-6">
                <div className="w-10 h-10 bg-orange-50 flex items-center justify-center shrink-0 z-10 border border-orange-200">
                  <AlertTriangle size={18} className="text-orange-600" />
                </div>
                <div className="flex-1 bg-orange-50/20 border border-orange-100 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">T+45s Root Cause</span>
                    <span className="text-[10px] text-[#64748b] font-mono">14:22:55 UTC</span>
                  </div>
                  <h4 className="font-bold text-[#1e293b] mb-1">Fatigue Failure: Seal Gasket G-91</h4>
                  <p className="text-sm text-[#64748b]">
                    Imaging analysis confirms microscopic fracture in housing seal. Accelerated MTBF degradation due to environmental corrosion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule (1/3) */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Calendar size={14} className="text-[#2563eb]" />
                Maintenance Schedule
              </h3>
              <a className="text-[11px] text-[#2563eb] font-bold hover:underline" href="#"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                VIEW ALL
              </a>
            </div>

            <div className="p-6 space-y-4">
              {/* Task 1 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 border border-[#e2e8f0] flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors">
                  <Drum size={18} className="text-[#64748b] group-hover:text-[#2563eb]" />
                </div>
                <div className="flex-1 border-b border-[#e2e8f0] pb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#1e293b]">Oil Filter Replacement</h4>
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-100 uppercase">URGENT</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1">Pump Alpha-2 showing cavitation signs.</p>
                  <div className="flex gap-6 mt-2 text-[10px] text-[#64748b] font-medium">
                    <span className="flex items-center gap-1"><Clock size={10} /> 2 HRS</span>
                    <span className="flex items-center gap-1"><User size={10} /> 2 TECHS</span>
                  </div>
                </div>
              </div>

              {/* Task 2 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 border border-[#e2e8f0] flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors">
                  <Target size={18} className="text-[#64748b] group-hover:text-[#2563eb]" />
                </div>
                <div className="flex-1 border-b border-[#e2e8f0] pb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#1e293b]">Alignment Calibration</h4>
                    <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 border border-orange-100 uppercase">PREVENT</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1">Drive Shaft Gamma showing minor offset.</p>
                  <div className="flex gap-6 mt-2 text-[10px] text-[#64748b] font-medium">
                    <span className="flex items-center gap-1"><Calendar size={10} /> OCT 12</span>
                    <span className="flex items-center gap-1"><User size={10} /> 1 TECH</span>
                  </div>
                </div>
              </div>

              {/* Task 3 */}
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 border border-[#e2e8f0] flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors">
                  <Terminal size={18} className="text-[#64748b] group-hover:text-[#2563eb]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#1e293b]">Firmware Update v4.2</h4>
                    <span className="text-[9px] font-bold text-[#2563eb] bg-blue-50 px-1.5 py-0.5 border border-blue-100 uppercase">SYSTEM</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1">Optimize RAG engine retrieval speed.</p>
                  <div className="flex gap-6 mt-2 text-[10px] text-[#64748b] font-medium">
                    <span className="flex items-center gap-1"><History size={10} /> NEXT REBOOT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Capacity */}
            <div className="p-6 bg-slate-50 border-t border-[#e2e8f0]">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Resource Capacity
                </span>
                <span className="text-[10px] font-bold text-[#2563eb]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  65% UTILIZED
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5">
                <div className="h-full bg-[#2563eb]" style={{ width: '65%' }} />
              </div>
              <button className="w-full mt-6 border border-[#2563eb] border-dashed py-2 text-[#2563eb] text-[11px] font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                <Plus size={12} /> ADD MANUAL TASK
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="border-t border-[#e2e8f0] bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 animate-subtle-pulse" />
            <span className="text-[11px] font-bold text-[#64748b] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Live Telemetry Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#64748b]" />
            <span className="text-[11px] text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              NODE: RF-ALPHA-09
            </span>
          </div>
        </div>
        <div className="flex gap-6">
          <button className="text-[11px] font-bold text-[#64748b] hover:text-[#2563eb] flex items-center gap-1"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <FileText size={14} /> LOGS
          </button>
          <button className="text-[11px] font-bold text-[#64748b] hover:text-[#2563eb] flex items-center gap-1"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <Settings size={14} /> SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}
