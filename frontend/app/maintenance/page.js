'use client';

import React, { useState, useEffect } from 'react';
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
  Send,
  Brain,
} from 'lucide-react';
import { fetchMetrics, queryAgent } from '../../lib/api';

export default function MaintenancePage() {
  const [metrics, setMetrics] = useState({ uptime: 0, active_hypotheses: 0, outstanding_audits: 0, critical_gaps: 0 });
  const [rcaMessages, setRcaMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setRcaMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await queryAgent(input);
      setRcaMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setRcaMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: `[CONNECTION ERROR] ${err.message}`, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const metricsData = [
    { label: 'MTBF', value: '412.5 hrs', trend: '↑ +12% VS LAST CYCLE', trendColor: 'text-green-600', icon: Timer },
    { label: 'MTTR', value: '2.8 hrs', trend: '↓ -4% EFFICIENCY LOSS', trendColor: 'text-red-500', icon: WrenchIcon },
    { label: 'ACTIVE HYPOTHESES', value: metrics.active_hypotheses.toString().padStart(2, '0'), trend: 'AI DIAGNOSTICS RUNNING', trendColor: 'text-[#64748b]', icon: AlertOctagon, valueColor: 'text-amber-600' },
    { label: 'SYSTEM HEALTH', value: `${metrics.uptime}%`, progress: metrics.uptime, icon: HeartPulse },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Activity size={14} className="text-[#2563eb]" />
                Root Cause Analysis Assistant
              </h3>
              <div className="flex gap-1.5">
                <button className="p-1 hover:bg-slate-200 transition-colors">
                  <Share2 size={14} className="text-[#64748b]" />
                </button>
                <button onClick={() => setRcaMessages([])} className="p-1 hover:bg-slate-200 transition-colors">
                  <RefreshCw size={14} className="text-[#64748b]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
              {rcaMessages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-[#64748b] space-y-4">
                  <AlertTriangle size={48} className="text-[#cbd5e1]" />
                  <p className="text-sm font-medium">Ask the RCA Agent to diagnose a fault or error code.</p>
                </div>
              )}

              {rcaMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' ? (
                    <div className="w-9 h-9 bg-orange-600 flex items-center justify-center shrink-0">
                      <Brain size={18} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 border border-[#e2e8f0] bg-[#dbeafe] text-[#1e40af] flex items-center justify-center shrink-0 text-[10px] font-bold">
                      U
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-xl ${msg.role === 'user' ? 'bg-slate-800 text-white p-4' : 'bg-white border border-[#e2e8f0] p-6 shadow-sm'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-bold text-orange-600 uppercase">RCA AGENT DIAGNOSTICS</span>
                      </div>
                    )}
                    <div className={`space-y-4 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : msg.isError ? 'text-red-600' : 'text-[#1e293b]'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 bg-orange-600 flex items-center justify-center shrink-0">
                    <Brain size={18} className="text-white animate-pulse" />
                  </div>
                  <div className="flex-1 bg-white border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="text-sm text-[#64748b] animate-pulse">Running diagnostics...</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-[#e2e8f0]">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isTyping}
                  placeholder="Describe the fault or error code..."
                  className="w-full bg-slate-50 border border-[#e2e8f0] py-3 pl-4 pr-12 text-sm focus:ring-0 focus:border-[#2563eb] outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white hover:bg-orange-700 transition-all disabled:opacity-50">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] flex flex-col h-[500px]">
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

            <div className="p-6 space-y-4 overflow-y-auto">
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

            <div className="p-6 bg-slate-50 border-t border-[#e2e8f0] mt-auto">
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
