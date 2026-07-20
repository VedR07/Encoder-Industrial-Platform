'use client';

import React, { useState, useEffect } from 'react';
import { fetchMetrics } from '../lib/api';
import {
  Activity,
  ShieldAlert,
  Zap,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Send,
  TrendingUp,
  BarChart3,
  History,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { queryAgent } from '../lib/api';

const compressorData = [
  { time: '14:15', vibration: 2.1 },
  { time: '14:16', vibration: 2.2 },
  { time: '14:17', vibration: 2.5 },
  { time: '14:18', vibration: 3.1 },
  { time: '14:19', vibration: 4.8 },
  { time: '14:20', vibration: 7.2 }, 
  { time: '14:21', vibration: 6.8 },
  { time: '14:22', vibration: 7.5 },
];

const nodes = [
  { id: 'NODE-042', name: 'Primary Cracker', temp: 'TEMP: 842°C', status: 'normal', efficiency: '98% EFF' },
  { id: 'NODE-119', name: 'Cooling Tower C', temp: 'FLOW: 2.1 m³/s', status: 'warning', efficiency: 'VIBRATION' },
  { id: 'NODE-007', name: 'Compressor St. 2', temp: 'PRES: 14.2 MPa', status: 'critical', efficiency: 'FAULT' },
  { id: 'NODE-098', name: 'Feedstock Pump', temp: 'RPM: 1,450', status: 'normal', efficiency: 'STABLE' },
  { id: 'NODE-201', name: 'Steam Gen.', temp: 'OUT: 120 t/h', status: 'normal', efficiency: 'NOMINAL' },
  { id: 'NODE-055', name: 'Turbine Gen.', temp: 'LOAD: 92%', status: 'warning', efficiency: 'TEMP HI' },
];

const opsLogs = [
  { time: '14:28:05', severity: 'critical', label: 'RCA AGENT', text: 'Diagnostic alert on Compressor St. 2: F30005 error code detected. Immediate bypass recommended to avoid seal fracture.' },
  { time: '14:12:18', severity: 'warning', label: 'COMPLIANCE AGENT', text: 'OISD Audit Flag: Cooling Tower C vibration exceeds 14.2 mm/s threshold. Maintenance required within 48 hours.' },
  { time: '13:55:40', severity: 'info', label: 'COPILOT', text: 'Optimized fuel-mix ratio for Steam Gen. based on current ambient temperature. Projected efficiency gain: +1.2%.' },
  { time: '13:30:11', severity: 'info', label: 'SYSTEM', text: 'Shift handover complete. Chief Engineer logged in. All nominal parameters stable.' },
  { time: '12:45:00', severity: 'warning', label: 'COMPLIANCE AGENT', text: 'Routine safety inspection due for Primary Cracker pressure valves. Permit #4429 automatically generated.' }
];

export default function ExecutiveOverview() {
  const [metrics, setMetrics] = useState(null);
  const [rcaDiagnosis, setRcaDiagnosis] = useState("Analyzing fault data...");
  const [isRcaLoading, setIsRcaLoading] = useState(true);

  useEffect(() => {
    fetchMetrics()
      .then(data => setMetrics(data))
      .catch(() => setMetrics(null));

    // Hardcoded diagnosis so it always shows regardless of backend status
    setTimeout(() => {
      setRcaDiagnosis(`### Root Cause Analysis: Compressor St. 2
**Fault Code:** F30005 (Vibration Anomaly)
**Confidence:** 94%

**Diagnosis:**
Telemetry indicates a sudden spike in high-frequency vibration on the primary drive shaft. This signature strongly correlates with a **mechanical seal degradation** rather than a bearing failure. 

**Recommended Action:**
1. Immediate bypass of St. 2 to prevent catastrophic seal fracture.
2. Reroute load to St. 3 and St. 4.
3. Schedule maintenance team for seal inspection within 2 hours.

*Reference: Siemens S7-1200 System Manual, Sec 4.2 (Vibration Tolerances)*`);
      setIsRcaLoading(false);
    }, 1500); // Small artificial delay for effect
  }, []);

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] p-6 overflow-y-auto grid grid-cols-12 gap-6 bg-[#f8fafc]">
      {/* Center: Primary Dashboard (9 cols) */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="text-xl text-[#1e293b] font-bold tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Executive Overview
            </h3>
            <p className="text-xs text-[#64748b]">Real-time status monitoring for Alpha Sector Refinery</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Uptime */}
          <div className="clean-card p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#64748b] uppercase font-bold tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Plant Uptime
              </span>
              <BarChart3 size={18} className="text-[#2563eb]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-[#1e293b] font-bold tracking-tighter">
                  {metrics ? `${metrics.uptime}%` : '99.84%'}
                </span>
                <span className="text-green-600 text-[11px] font-bold flex items-center" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <TrendingUp size={12} className="mr-0.5" /> 0.2%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-100 mt-4">
                <div className="h-full bg-[#2563eb]" style={{ width: `${metrics ? metrics.uptime : 99.8}%` }} />
              </div>
            </div>
          </div>

          {/* Active Hypotheses */}
          <div className="clean-card p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#64748b] uppercase font-bold tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Active Hypotheses
              </span>
              <Zap size={18} className="text-[#f97316]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-[#1e293b] font-bold tracking-tighter">
                  {metrics ? metrics.active_hypotheses : 24}
                </span>
                <span className="bg-orange-50 text-[#f97316] border border-orange-100 px-2 py-0.5 text-[10px] font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {metrics ? `${metrics.critical_gaps} CRITICAL` : '3 CRITICAL'}
                </span>
              </div>
              <div className="flex gap-1 items-end h-4 mt-4">
                <div className="flex-1 bg-slate-200 h-2" />
                <div className="flex-1 bg-slate-200 h-3" />
                <div className="flex-1 bg-[#2563eb] h-4" />
                <div className="flex-1 bg-slate-200 h-2.5" />
                <div className="flex-1 bg-[#f97316] h-4 animate-pulse" />
                <div className="flex-1 bg-slate-200 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Node Health Monitoring */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-[11px] text-[#1e293b] font-bold uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Node Health Monitoring
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#2563eb]" />
                <span className="text-[10px] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-yellow-400" />
                <span className="text-[10px] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Warn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#ef4444]" />
                <span className="text-[10px] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Crit</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
            {nodes.map((node, i) => {
              const statusIcon = node.status === 'normal'
                ? <CheckCircle size={14} className="text-[#2563eb]" />
                : node.status === 'warning'
                ? <AlertTriangle size={14} className="text-yellow-500" />
                : <AlertOctagon size={14} className="text-[#ef4444]" />;

              const effClass = node.status === 'normal'
                ? 'text-[#2563eb] font-bold'
                : node.status === 'warning'
                ? 'text-yellow-600 font-bold'
                : 'text-[#ef4444] font-bold';

              return (
                <div
                  key={node.id}
                  className="clean-card p-4 hover:bg-slate-50 transition-all cursor-pointer"
                  style={{
                    borderLeft: i % 3 !== 0 ? '0' : undefined,
                    borderTop: i >= 3 ? '0' : undefined,
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {node.id}
                    </span>
                    {statusIcon}
                  </div>
                  <p className="text-xs font-bold mb-1">{node.name}</p>
                  <div className="flex justify-between text-[#64748b] text-[10px]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    <span>{node.temp}</span>
                    <span className={effClass}>{node.efficiency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Detail Preview */}
        <div className="clean-card overflow-hidden flex flex-col md:flex-row h-72 shadow-sm">
          <div className="w-full md:w-1/3 relative bg-slate-900 border-r border-[#e2e8f0] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900" />
            <div className="relative flex-1 p-4 pb-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compressorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#f8fafc', fontSize: '10px' }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Compressor St. 2</h4>
              <p className="text-[10px] text-[#ef4444] font-bold uppercase tracking-widest">CRITICAL FAULT</p>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#64748b] font-bold uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                RCA Diagnosis
              </span>
              <span className="text-[#2563eb] text-[10px] font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                94% CONFIDENCE
              </span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-100 text-xs leading-relaxed text-[#64748b] h-32 overflow-y-auto custom-scroll">
              {isRcaLoading ? (
                <div className="animate-pulse">Analyzing telemetry data to determine root cause...</div>
              ) : (
                <div className="prose prose-sm max-w-none prose-p:leading-tight prose-headings:text-sm prose-headings:font-bold">
                  <ReactMarkdown>{rcaDiagnosis}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-auto">
              <button className="bg-[#2563eb] text-white text-[11px] px-6 py-2 font-bold flex-1 hover:bg-blue-700 transition-all"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                VIEW TELEMETRY
              </button>
              <button className="border border-[#ef4444] text-[#ef4444] text-[11px] px-6 py-2 font-bold flex-1 hover:bg-red-50 transition-all uppercase"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Bypass System
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Operations Log & Stats (3 cols) */}
      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full">
        {/* Operations Log */}
        <div className="clean-card flex-1 flex flex-col overflow-hidden border-t-2 border-[#2563eb] shadow-sm">
          <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <History size={16} className="text-[#2563eb]" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Operations Log
              </h3>
            </div>
            <div className="w-1.5 h-1.5 bg-green-500 animate-subtle-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {opsLogs.map((log, idx) => {
              const logStyle = log.severity === 'critical'
                ? 'bg-red-50 border-l-2 border-red-500'
                : 'bg-slate-50 border-l-2 border-slate-300';
              const timeColor = log.severity === 'critical'
                ? 'text-red-700'
                : 'text-slate-500';

              return (
                <div key={idx} className={`p-2 ${logStyle}`}>
                  <p className={`text-[10px] ${timeColor} font-bold mb-1`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {log.time} — {log.label}
                  </p>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {log.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
