'use client';

import React, { useState, useEffect } from 'react';
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
  Send,
  Brain,
} from 'lucide-react';
import { fetchMetrics, queryAgent } from '../../lib/api';

const dossierData = [
  { id: 'DOS-OISD-2023-094', standard: 'OISD-150', entity: 'Flare Header System', artifacts: ['PDF', 'XLS'], extra: '+2', status: 'PENDING', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'DOS-PESO-2023-112', standard: 'PESO-SMPV', entity: 'Hydrogen Storage', artifacts: ['CAD', 'IMG'], extra: null, status: 'VERIFIED', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'DOS-FACT-2024-001', standard: 'FAC-ACT-CH4', entity: 'Ventilation Unit 08', artifacts: ['DOC'], extra: null, status: 'REJECTED', statusColor: 'bg-red-50 text-red-700 border-red-200' },
];

export default function CompliancePage() {
  const [metrics, setMetrics] = useState({ uptime: 0, active_hypotheses: 0, outstanding_audits: 0, critical_gaps: 0 });
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await queryAgent(input);
      setChatMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: `[CONNECTION ERROR] ${err.message}`, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const scoreboards = [
    { label: 'OUTSTANDING AUDITS', sublabel: 'Pending Reviews', icon: Factory, score: metrics.outstanding_audits, isPercentage: false, barColor: 'bg-amber-500', status: 'STATUS: ACTION REQUIRED', statusColor: 'text-amber-600', time: 'LIVE' },
    { label: 'CRITICAL GAPS', sublabel: 'Regulatory Deficiencies', icon: Flame, score: metrics.critical_gaps, isPercentage: false, barColor: 'bg-red-500', status: 'STATUS: URGENT', statusColor: 'text-red-600', time: 'LIVE' },
    { label: 'SYSTEM HEALTH', sublabel: 'Overall Uptime', icon: Shield, score: metrics.uptime, isPercentage: true, barColor: 'bg-[#2563eb]', status: 'STATUS: OPTIMAL', statusColor: 'text-slate-400', time: 'LIVE' },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto">
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
                <span className="text-2xl font-bold text-[#2563eb]">{metrics.uptime}%</span>
              </div>
              <div className="w-48 h-2 bg-slate-200 relative">
                <div className="absolute inset-0 bg-[#2563eb]" style={{ width: `${metrics.uptime}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-[#2563eb] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Start Audit
              </button>
              <button className="bg-white border border-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Export Report
              </button>
            </div>
          </div>
        </div>

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
                    {s.score}<span className="text-lg text-slate-400">{s.isPercentage ? '%' : ''}</span>
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 mb-2">
                    <div className={`${s.barColor} h-full`} style={{ width: s.isPercentage ? `${s.score}%` : `${Math.min(s.score * 10, 100)}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold border-t border-slate-50 pt-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <span className={s.statusColor}>{s.status}</span>
                  <span className="text-slate-400">{s.time}</span>
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <FolderOpen size={18} className="text-[#2563eb]" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Evidence Packages Dossier</h3>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#2563eb] hover:bg-blue-50 px-3 py-1 transition-colors uppercase border border-blue-100" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                <Upload size={12} /> Upload Documents
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
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
                      <td className="px-4 py-4 text-[11px] text-slate-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{row.id}</td>
                      <td className="px-4 py-4 font-semibold">{row.standard}</td>
                      <td className="px-4 py-4">{row.entity}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {row.artifacts.map((a, j) => (
                            <span key={j} className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold border border-slate-200">{a}</span>
                          ))}
                          {row.extra && <span className="px-1.5 py-0.5 bg-blue-50 text-[#2563eb] text-[9px] font-bold border border-blue-100">{row.extra}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${row.statusColor}`}>{row.status}</span>
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

            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <span>Showing 1-3 of 24 Packages</span>
              <div className="flex border border-slate-200 bg-white">
                <button className="px-2 py-1 hover:bg-slate-50 border-r border-slate-200"><ChevronLeft size={12} /></button>
                <button className="px-2 py-1 hover:bg-slate-50"><ChevronRight size={12} /></button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col h-[600px] gap-6">
            <div className="bg-white border border-slate-200 shadow-sm flex flex-col flex-1">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <Brain size={16} className="text-[#2563eb]" />
                  Compliance Assistant
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 custom-scroll">
                {chatMessages.length === 0 && !isTyping && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <Shield size={32} className="text-slate-300" />
                    <p className="text-xs font-medium text-center">Ask about OISD, PESO, or Factory Act regulations.</p>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' ? (
                      <div className="w-8 h-8 bg-[#2563eb] flex items-center justify-center shrink-0">
                        <Brain size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 border border-slate-200 bg-blue-50 text-[#1e40af] flex items-center justify-center shrink-0 text-[10px] font-bold">
                        U
                      </div>
                    )}
                    <div className={`p-3 text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
                      {msg.isError ? <span className="text-red-600">{msg.content}</span> : msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#2563eb] flex items-center justify-center shrink-0">
                      <Brain size={14} className="text-white animate-pulse" />
                    </div>
                    <div className="p-3 bg-white border border-slate-200 text-slate-400 text-xs shadow-sm animate-pulse">
                      Analyzing regulations...
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-slate-200 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isTyping}
                    placeholder="Ask about compliance..."
                    className="w-full bg-slate-50 border border-slate-200 py-2 pl-3 pr-10 text-xs focus:ring-0 focus:border-[#2563eb] outline-none"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isTyping}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-white bg-[#2563eb] hover:bg-blue-700 transition-colors disabled:opacity-50">
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-[#2563eb] shrink-0">
              <h4 className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Quality Engine Runtime
              </h4>
              <div className="space-y-3">
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

      <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#2563eb] text-white shadow-lg flex items-center justify-center transition-all hover:bg-blue-700 active:scale-95 z-50">
        <Plus size={20} />
      </button>
    </div>
  );
}
