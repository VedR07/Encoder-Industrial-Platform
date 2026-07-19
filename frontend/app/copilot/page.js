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
import { queryAgent } from '../../lib/api';

export default function CopilotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await queryAgent(input);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `[CONNECTION ERROR] Could not reach the AI backend. Please ensure the server is running. (${err.message})`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

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
            
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-64 text-[#64748b] space-y-4">
                <Brain size={48} className="text-[#cbd5e1]" />
                <p className="text-sm font-medium">Hello User. How can I assist you with your operations today?</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="w-9 h-9 bg-[#2563eb] flex items-center justify-center shrink-0">
                    <Brain size={18} className="text-white" />
                  </div>
                ) : (
                  <div className="w-9 h-9 border border-[#e2e8f0] bg-[#dbeafe] text-[#1e40af] flex items-center justify-center shrink-0 text-[10px] font-bold">
                    U
                  </div>
                )}
                
                <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'bg-slate-800 text-white p-4 shadow-sm' : 'bg-white border border-[#e2e8f0] p-6 shadow-sm'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#1e293b]">INTELLIPLANT AI</span>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 font-bold border border-blue-100">
                          DIAGNOSTICS ACTIVE
                        </span>
                      </div>
                      <span className="text-[10px] text-[#64748b]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                <div className="w-9 h-9 bg-[#2563eb] flex items-center justify-center shrink-0">
                  <Brain size={18} className="text-white animate-pulse" />
                </div>
                <div className="flex-1 bg-white border border-[#e2e8f0] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#1e293b]">INTELLIPLANT AI</span>
                  </div>
                  <div className="text-sm text-[#64748b] animate-pulse">Analyzing...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-[#e2e8f0]">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-slate-50 border border-[#e2e8f0] py-3 pl-4 pr-32 text-sm focus:ring-0 focus:border-[#2563eb] resize-none min-h-[56px] outline-none"
                placeholder="Ask the Copilot or type a command..."
                disabled={isTyping}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-3">
                <button className="text-[#64748b] hover:text-[#2563eb]">
                  <Paperclip size={16} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="bg-[#2563eb] text-white px-4 py-1.5 text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
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
