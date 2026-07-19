'use client';

import React, { useState } from 'react';
import {
  Brain,
  Paperclip,
  Send,
  BadgeCheck,
  FileText,
  Clock,
  AlertCircle,
  Share2,
} from 'lucide-react';

export default function CopilotPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Center: Copilot View */}
      <section className="flex-1 bg-slate-50 flex flex-col relative">
        {/* Session Header */}
        <div className="h-12 border-b border-[#e2e8f0] bg-white flex items-center px-6 justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#1e293b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              REFINERY_ALPHA DIAGNOSTIC SESSION
            </span>
            <span className="text-[10px] text-[#64748b] bg-slate-100 px-2 py-0.5 border border-[#e2e8f0]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              REFA_DIAG_0041
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-[#2563eb] font-bold hover:underline flex items-center gap-1">
              <Share2 size={12} /> SHARE SESSION
            </button>
          </div>
        </div>

        {/* Chat Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* AI Message */}
            <div className="flex gap-4">
              <div className="w-9 h-9 bg-[#2563eb] flex items-center justify-center shrink-0">
                <Brain size={18} className="text-white" />
              </div>
              <div className="flex-1 bg-white border border-[#e2e8f0] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#1e293b]">INTELLIPLANT AI</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 font-bold border border-blue-100">
                      DIAGNOSTICS ACTIVE
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">14:25 UTC</span>
                </div>

                <div className="space-y-4 text-sm text-[#1e293b] leading-relaxed">
                  <p>
                    Analysis of telemetry and maintenance records{' '}
                    <span className="font-bold text-[#2563eb]">[DOC_ID: MAINT-2023-Q3-091]</span>{' '}
                    indicates a <span className="text-red-600 font-bold">high probability (88%)</span>{' '}
                    that the current vibration profile matches the actuator seal failure observed in August.
                  </p>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 gap-0 border border-[#e2e8f0]">
                    <div className="p-4 border-r border-[#e2e8f0] bg-slate-50/50">
                      <div className="text-[10px] text-[#64748b] font-bold uppercase mb-1">Current Frequency</div>
                      <div className="text-xl font-bold text-[#1e293b]">
                        142.5 Hz <span className="text-xs text-red-600 font-medium ml-1">↑ 12%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/50">
                      <div className="text-[10px] text-[#64748b] font-bold uppercase mb-1">Historical Threshold</div>
                      <div className="text-xl font-bold text-[#1e293b]">138.0 Hz</div>
                    </div>
                  </div>

                  {/* Confidence Meter */}
                  <div className="bg-blue-50/50 p-4 border-l-2 border-[#2563eb]">
                    <h4 className="text-xs font-bold text-[#2563eb] mb-2 flex items-center gap-1.5">
                      <BadgeCheck size={14} />
                      RAG ANALYSIS CONFIDENCE: 94.2%
                    </h4>
                    <div className="w-full h-1.5 bg-slate-200 mb-1">
                      <div className="h-full bg-[#2563eb]" style={{ width: '94.2%' }} />
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#1e293b]">Evidence Base:</h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-[#e2e8f0] text-[11px] text-[#64748b] cursor-pointer hover:bg-slate-200 transition-colors">
                        <Paperclip size={11} /> Valve_Specs_CV402_RevB.pdf
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-[#e2e8f0] text-[11px] text-[#64748b] cursor-pointer hover:bg-slate-200 transition-colors">
                        <FileText size={11} /> Post_Mortem_Aug_2023.md
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="ml-12 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 bg-white border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-blue-50/30 transition-all text-left">
                <div>
                  <p className="text-xs font-bold text-[#1e293b]">Create Maintenance Ticket</p>
                  <p className="text-[10px] text-[#64748b] uppercase mt-1">Priority: High</p>
                </div>
                <span className="text-[#2563eb]">→</span>
              </button>
              <button className="flex items-center justify-between p-4 bg-white border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-blue-50/30 transition-all text-left">
                <div>
                  <p className="text-xs font-bold text-[#1e293b]">Deploy Inspection Drone</p>
                  <p className="text-[10px] text-[#64748b] uppercase mt-1">Visual Check</p>
                </div>
                <span className="text-[#2563eb]">→</span>
              </button>
            </div>

            {/* User Message */}
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-9 h-9 border border-[#e2e8f0] bg-[#dbeafe] text-[#1e40af] flex items-center justify-center shrink-0 text-[10px] font-bold">
                RP
              </div>
              <div className="flex-1 max-w-xl bg-slate-800 text-white p-4 shadow-sm">
                <p className="text-sm">
                  Analyze current vibration data for CV-402 and cross-reference with the maintenance history from Q3. Is this a repeat of the actuator seal failure?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-[#e2e8f0]">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                className="w-full bg-slate-50 border border-[#e2e8f0] py-3 pl-4 pr-32 text-sm focus:ring-0 focus:border-[#2563eb] resize-none min-h-[56px] outline-none"
                placeholder="Ask the Copilot or type a command..."
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-3">
                <button className="text-[#64748b] hover:text-[#2563eb]">
                  <Paperclip size={16} />
                </button>
                <button className="bg-[#2563eb] text-white px-4 py-1.5 text-xs font-bold hover:bg-blue-700 transition-all"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  SEND
                </button>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center px-1">
              <div className="flex gap-4 text-[10px] font-bold text-[#64748b] uppercase tracking-tighter" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500" /> RAG ONLINE
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500" /> ENGINE v4.2
                </span>
              </div>
              <div className="text-[10px] text-[#64748b] italic">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white border-l border-[#e2e8f0] flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0] bg-slate-50">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Context Insights
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-6">
          {/* Live Telemetry */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Live Telemetry: CV-402
            </p>
            <div className="p-4 bg-slate-50 border border-[#e2e8f0]">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-[#1e293b]">142.5</span>
                <span className="text-[10px] text-[#64748b] font-bold uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Frequency (Hz)
                </span>
              </div>
              <div className="h-12 flex items-end gap-0.5">
                <div className="flex-1 bg-[#2563eb]/20 h-[40%]" />
                <div className="flex-1 bg-[#2563eb]/30 h-[55%]" />
                <div className="flex-1 bg-[#2563eb]/40 h-[45%]" />
                <div className="flex-1 bg-[#2563eb]/50 h-[70%]" />
                <div className="flex-1 bg-red-500/80 h-[95%]" />
              </div>
            </div>
          </div>

          {/* Data Coverage */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Data Coverage
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>Technical Schematics</span>
                  <span>100%</span>
                </div>
                <div className="h-1.5 bg-slate-100">
                  <div className="h-full bg-[#2563eb]" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>Maintenance Logs</span>
                  <span>82%</span>
                </div>
                <div className="h-1.5 bg-slate-100">
                  <div className="h-full bg-[#2563eb]" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Collaborators
            </p>
            <div className="flex gap-2">
              <div className="w-8 h-8 border border-[#e2e8f0] bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#64748b]" title="Marcus Wright">
                MW
              </div>
              <div className="w-8 h-8 border border-[#e2e8f0] bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#64748b]" title="Sarah Connor">
                SC
              </div>
              <button className="w-8 h-8 border border-[#e2e8f0] flex items-center justify-center text-[10px] font-bold text-[#64748b] hover:bg-slate-50 transition-colors">
                +2
              </button>
            </div>
            <button className="w-full py-2 bg-slate-50 border border-[#e2e8f0] text-[11px] font-bold text-[#2563eb] hover:bg-slate-100 transition-colors uppercase tracking-tight"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Consult Experts
            </button>
          </div>

          {/* Asset Integrity Alert */}
          <div className="mt-auto p-4 bg-red-50 border border-red-200">
            <div className="flex items-center gap-1.5 text-red-600 mb-1.5">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase">Asset Integrity Alert</span>
            </div>
            <p className="text-[11px] text-[#1e293b]">
              Thermal drift on <span className="font-bold">CV-402</span>. Predicted failure window:{' '}
              <span className="text-red-600 font-bold">18h 42m</span>.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
