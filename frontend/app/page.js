'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchMetrics } from '../lib/api';
import {
  Activity, ShieldAlert, Zap, CheckCircle, AlertTriangle,
  AlertOctagon, TrendingUp, BarChart3, History, Brain,
  Wrench, ShieldCheck, ArrowRight, Thermometer, Gauge,
  Radio, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine,
} from 'recharts';
import ReactMarkdown from 'react-markdown';

// ─── Static node data ────────────────────────────────────────────────────────
const nodes = [
  { id: 'NODE-042', name: 'Primary Cracker',  metric: 'TEMP: 842°C',    status: 'normal',   badge: '98% EFF'   },
  { id: 'NODE-119', name: 'Cooling Tower C',  metric: 'FLOW: 2.1 m³/s', status: 'warning',  badge: 'VIBRATION' },
  { id: 'NODE-007', name: 'Compressor St. 2', metric: 'PRES: 14.2 MPa', status: 'critical', badge: 'FAULT'     },
  { id: 'NODE-098', name: 'Feedstock Pump',   metric: 'RPM: 1,450',     status: 'normal',   badge: 'STABLE'    },
  { id: 'NODE-201', name: 'Steam Gen.',        metric: 'OUT: 120 t/h',   status: 'normal',   badge: 'NOMINAL'   },
  { id: 'NODE-055', name: 'Turbine Gen.',      metric: 'LOAD: 92%',      status: 'warning',  badge: 'TEMP HI'   },
];

// ─── Proactive agent ticker messages ─────────────────────────────────────────
const proactiveAlerts = [
  { agent: 'RCA Agent',         color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-200',    icon: Wrench,      text: 'Compressor St. 2 — F30005 fault: mechanical seal degradation predicted within 2 hrs. Bypass recommended.' },
  { agent: 'Compliance Agent',  color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', icon: ShieldCheck, text: 'OISD Clause 4.1 alert: Cooling Tower C vibration (7.2 mm/s) exceeds 7.0 mm/s norm. Action required within 48 hrs.' },
  { agent: 'Copilot',           color: '#2563eb', bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Brain,       text: 'Predictive insight: Turbine Gen. TEMP HI pattern matches 3 prior incidents in knowledge base. Recommended coolant check.' },
  { agent: 'Compliance Agent',  color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', icon: ShieldCheck, text: 'Safety permit #4429 auto-generated for Primary Cracker pressure valve inspection due in 6 hrs.' },
  { agent: 'RCA Agent',         color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-200',    icon: Wrench,      text: 'Feedstock Pump RPM trending 4% below baseline. Correlated with last bearing replacement 212 days ago — schedule inspection.' },
  { agent: 'Copilot',           color: '#2563eb', bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Brain,       text: 'Steam Gen. optimisation: adjusting fuel-mix ratio based on ambient temp (34°C). Projected efficiency gain: +1.2%.' },
];

// ─── Seed telemetry with a realistic fault spike ──────────────────────────────
function seedVibration() {
  const base = [];
  const now = new Date();
  for (let i = 14; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 1500);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const spike = i < 4;  // last 4 points show elevated / fault state
    const val = spike
      ? 6.2 + Math.random() * 1.6        // fault zone 6.2 – 7.8
      : 1.8 + Math.random() * 0.8;       // normal zone 1.8 – 2.6
    base.push({ time: label, value: parseFloat(val.toFixed(2)) });
  }
  return base;
}

function seedTemp() {
  const base = [];
  const now = new Date();
  for (let i = 14; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 1500);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const val = 78 + Math.random() * 18;
    base.push({ time: label, value: parseFloat(val.toFixed(1)) });
  }
  return base;
}

// ─── Initial ops log ─────────────────────────────────────────────────────────
const initialLogs = [
  { time: '14:28:05', severity: 'critical', label: 'RCA AGENT',        text: 'Compressor St. 2: F30005 — seal degradation. Bypass recommended.' },
  { time: '14:12:18', severity: 'warning',  label: 'COMPLIANCE AGENT', text: 'OISD Clause 4.1: Cooling Tower C vibration at 7.2 mm/s (limit 7.0).' },
  { time: '13:55:40', severity: 'info',     label: 'COPILOT',           text: 'Steam Gen. fuel-mix optimised. Efficiency gain: +1.2%.' },
  { time: '13:30:11', severity: 'info',     label: 'SYSTEM',            text: 'Shift handover complete. Chief Engineer authenticated.' },
  { time: '12:45:00', severity: 'warning',  label: 'COMPLIANCE AGENT', text: 'Permit #4429 auto-generated for Primary Cracker valve inspection.' },
];

const MAX_POINTS = 20;

// ─── Custom tooltip ──────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-[#334155] px-3 py-2 text-white text-[10px] shadow-xl">
      <p className="text-[#94a3b8] mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{label}</p>
      <p className="font-bold text-[#ef4444]">{payload[0].value} {unit}</p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ExecutiveOverview() {
  const [metrics, setMetrics]             = useState(null);
  const [vibData, setVibData]             = useState(seedVibration);
  const [tempData, setTempData]           = useState(seedTemp);
  const [tickerIdx, setTickerIdx]         = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [liveLogs, setLiveLogs]           = useState(initialLogs);
  const [rcaDiagnosis, setRcaDiagnosis]   = useState('');
  const [isRcaLoading, setIsRcaLoading]   = useState(true);
  const logsEndRef = useRef(null);

  // Fetch KPI metrics
  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(() => setMetrics(null));
  }, []);

  // Hardcoded RCA diagnosis (always shows)
  useEffect(() => {
    const timer = setTimeout(() => {
      setRcaDiagnosis(`### Root Cause Analysis: Compressor St. 2
**Fault Code:** F30005 (Vibration Anomaly)  **Confidence:** 94%

**Diagnosis:** High-frequency vibration spike on primary drive shaft. Signature strongly correlates with **mechanical seal degradation** — not bearing failure.

**Immediate Actions:**
1. Bypass St. 2 — prevent catastrophic seal fracture
2. Reroute load to St. 3 & St. 4
3. Schedule seal inspection within 2 hrs

*Ref: Siemens S7-1200 Manual §4.2 (Vibration Tolerances)*`);
      setIsRcaLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // ── Live vibration telemetry stream ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // Keeps fault zone elevated to tell the story
      const val = parseFloat((6.0 + Math.random() * 1.8).toFixed(2));
      setVibData(prev => [...prev.slice(-MAX_POINTS + 1), { time: now, value: val }]);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // ── Live temperature telemetry stream ────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const val = parseFloat((80 + Math.random() * 14).toFixed(1));
      setTempData(prev => [...prev.slice(-MAX_POINTS + 1), { time: now, value: val }]);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // ── Proactive ticker rotation ────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % proactiveAlerts.length);
        setTickerVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Live log injection ───────────────────────────────────────────────────
  const newLogMessages = [
    { severity: 'warning',  label: 'RCA AGENT',        text: 'Cooling Tower C: vibration trend +0.3 mm/s over last 5 min. Monitoring.' },
    { severity: 'info',     label: 'SYSTEM',            text: 'Knowledge graph updated — 12 new document relationships indexed.' },
    { severity: 'critical', label: 'COMPLIANCE AGENT',  text: 'OISD §8.3: Overdue inspection flag raised for PSV-88 on Steam Gen.' },
    { severity: 'info',     label: 'COPILOT',           text: 'Field query answered: S7-1200 PLC firmware update procedure retrieved.' },
  ];
  const logIdxRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const msg = newLogMessages[logIdxRef.current % newLogMessages.length];
      logIdxRef.current++;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLiveLogs(prev => [{ ...msg, time: now }, ...prev.slice(0, 8)]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const currentAlert = proactiveAlerts[tickerIdx];
  const AlertIcon = currentAlert.icon;

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-[#f8fafc]">

      {/* ── Proactive Agent Ticker Banner ──────────────────────────────────── */}
      <div
        className={`flex-shrink-0 border-b px-6 py-2.5 flex items-center gap-3 transition-all duration-400 ${currentAlert.bg} ${currentAlert.border}`}
        style={{ transition: 'opacity 0.4s ease', opacity: tickerVisible ? 1 : 0 }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentAlert.color }} />
          <AlertIcon size={13} style={{ color: currentAlert.color }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: currentAlert.color, fontFamily: '"JetBrains Mono", monospace' }}>
            {currentAlert.agent}
          </span>
        </div>
        <div className="w-px h-4 bg-current opacity-20" style={{ color: currentAlert.color }} />
        <p className="text-[11px] text-[#1e293b] leading-tight flex-1">{currentAlert.text}</p>
        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold cursor-pointer" style={{ color: currentAlert.color }}>
          Ask AI <ChevronRight size={10} />
        </span>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-12 gap-5">

        {/* Left/Centre 9 cols */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-5">

          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#1e293b] tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Predictive Command Center
              </h3>
              <p className="text-xs text-[#64748b]">Live telemetry · AI-proactive monitoring · Alpha Sector Refinery</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold bg-green-50 border border-green-200 px-3 py-1.5" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <Radio size={11} className="animate-pulse" /> LIVE
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Plant Uptime',       value: metrics ? `${metrics.uptime}%` : '94.7%',  sub: '↑ 0.2% vs yesterday', color: '#2563eb', Icon: BarChart3 },
              { label: 'Active Hypotheses',  value: metrics ? metrics.active_hypotheses : 3,    sub: '3 critical',          color: '#f97316', Icon: Zap       },
              { label: 'Outstanding Audits', value: metrics ? metrics.outstanding_audits : 7,   sub: '2 overdue',           color: '#ef4444', Icon: ShieldAlert },
              { label: 'Docs Indexed',       value: '2,490',                                     sub: '+12 this shift',      color: '#0d9488', Icon: Activity   },
            ].map(({ label, value, sub, color, Icon }) => (
              <div key={label} className="clean-card p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{label}</span>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-2xl font-bold text-[#1e293b] tracking-tighter">{value}</span>
                <span className="text-[10px] text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{sub}</span>
              </div>
            ))}
          </div>

          {/* ── Live Telemetry Charts ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Vibration (fault) */}
            <div className="clean-card overflow-hidden">
              <div className="bg-slate-900 px-4 pt-3 pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Compressor St. 2 — Vibration</p>
                    <p className="text-xs text-[#ef4444] font-bold">FAULT ZONE  &gt; 7.0 mm/s</p>
                  </div>
                  <span className="text-xl font-bold text-[#ef4444]">{vibData[vibData.length - 1]?.value} <span className="text-xs font-normal text-[#64748b]">mm/s</span></span>
                </div>
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={vibData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={7.0} stroke="#f97316" strokeDasharray="4 2" label={{ value: 'LIMIT', fill: '#f97316', fontSize: 8, position: 'right' }} />
                    <Tooltip content={<DarkTooltip unit="mm/s" />} />
                    <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#vibGrad)" dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Temperature (warning zone) */}
            <div className="clean-card overflow-hidden">
              <div className="bg-slate-900 px-4 pt-3 pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Turbine Gen. — Bearing Temp</p>
                    <p className="text-xs text-yellow-400 font-bold">WARNING ZONE  &gt; 88°C</p>
                  </div>
                  <span className="text-xl font-bold text-yellow-400">{tempData[tempData.length - 1]?.value} <span className="text-xs font-normal text-[#64748b]">°C</span></span>
                </div>
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={tempData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#facc15" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 120]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={88} stroke="#f97316" strokeDasharray="4 2" label={{ value: 'LIMIT', fill: '#f97316', fontSize: 8, position: 'right' }} />
                    <Tooltip content={<DarkTooltip unit="°C" />} />
                    <Area type="monotone" dataKey="value" stroke="#facc15" strokeWidth={2} fill="url(#tempGrad)" dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Node Health + RCA row */}
          <div className="grid grid-cols-12 gap-4">

            {/* Node Health */}
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Node Health</h3>
                <div className="flex gap-4">
                  {[['#2563eb', 'Normal'], ['#facc15', 'Warn'], ['#ef4444', 'Crit']].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <span className="w-2 h-2" style={{ backgroundColor: c }} />
                      <span className="text-[10px] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
                {nodes.map((node, i) => {
                  const isCrit = node.status === 'critical';
                  const isWarn = node.status === 'warning';
                  const Icon = isCrit ? AlertOctagon : isWarn ? AlertTriangle : CheckCircle;
                  const iconColor = isCrit ? 'text-[#ef4444]' : isWarn ? 'text-yellow-500' : 'text-[#2563eb]';
                  const badgeColor = isCrit ? 'text-[#ef4444]' : isWarn ? 'text-yellow-600' : 'text-[#2563eb]';
                  return (
                    <div
                      key={node.id}
                      className={`clean-card p-4 cursor-pointer hover:bg-slate-50 transition-all ${isCrit ? 'border-l-2 border-l-[#ef4444]' : isWarn ? 'border-l-2 border-l-yellow-400' : ''}`}
                      style={{ borderTop: i >= 3 ? '0' : undefined }}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{node.id}</span>
                        <Icon size={13} className={`${iconColor} ${isCrit ? 'animate-pulse' : ''}`} />
                      </div>
                      <p className="text-xs font-bold text-[#1e293b] mb-1">{node.name}</p>
                      <div className="flex justify-between text-[10px]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        <span className="text-[#64748b]">{node.metric}</span>
                        <span className={`font-bold ${badgeColor}`}>{node.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RCA Diagnosis Card */}
            <div className="col-span-12 md:col-span-5 clean-card flex flex-col overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>RCA Agent — Live Diagnosis</p>
                  <p className="text-[10px] text-[#ef4444] font-bold">NODE-007 · Compressor St. 2</p>
                </div>
                <span className="text-[10px] text-green-400 font-bold bg-green-900/40 px-2 py-0.5 border border-green-700/40" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  94% CONF
                </span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed text-[#475569] bg-white custom-scroll">
                {isRcaLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-slate-100 animate-pulse rounded" style={{ width: `${70 + i * 5}%` }} />)}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:text-xs prose-headings:font-bold prose-headings:text-[#1e293b] prose-p:text-[#475569]">
                    <ReactMarkdown>{rcaDiagnosis}</ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="flex gap-0 border-t border-[#e2e8f0]">
                <button className="flex-1 bg-[#2563eb] text-white text-[10px] py-2.5 font-bold hover:bg-blue-700 transition-all uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  View Telemetry
                </button>
                <button className="flex-1 border-l border-[#ef4444] text-[#ef4444] text-[10px] py-2.5 font-bold hover:bg-red-50 transition-all uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Bypass System
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar: Live Operations Log ─────────────────────────── */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-5">
          <div className="clean-card flex flex-col overflow-hidden border-t-2 border-[#2563eb] flex-1" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
            <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <History size={14} className="text-[#2563eb]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Agent Feed</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-green-600 font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>LIVE</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
              {liveLogs.map((log, idx) => {
                const isCrit = log.severity === 'critical';
                const isWarn = log.severity === 'warning';
                const style = isCrit
                  ? 'bg-red-50 border-l-2 border-red-500'
                  : isWarn
                  ? 'bg-orange-50 border-l-2 border-orange-400'
                  : 'bg-slate-50 border-l-2 border-slate-300';
                const timeColor = isCrit ? 'text-red-600' : isWarn ? 'text-orange-600' : 'text-slate-500';
                return (
                  <div
                    key={idx}
                    className={`p-2 ${style} transition-all`}
                    style={{ animation: idx === 0 ? 'slideInLog 0.4s ease' : undefined }}
                  >
                    <p className={`text-[9px] font-bold mb-1 ${timeColor}`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {log.time} · {log.label}
                    </p>
                    <p className="text-[11px] text-slate-700 leading-snug">{log.text}</p>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes slideInLog {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
