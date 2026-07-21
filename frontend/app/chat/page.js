'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Paperclip,
  Send,
  Wrench,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  Share2,
  FileText,
  Mic,
} from 'lucide-react';
import { queryAgent } from '../../lib/api';
import ReactMarkdown from 'react-markdown';

export default function UnifiedChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Agent Selector State
  const [selectedAgent, setSelectedAgent] = useState('COPILOT');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  // Session ID for backend history isolation
  const [sessionId, setSessionId] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(2, 15).toUpperCase());
  }, []);

  const handleShareSession = () => {
    const url = `${window.location.origin}/chat?session=${sessionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      alert(`Session link: ${url}`);
    });
  };
  
  // Attachment state
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  const handleVoiceInput = () => {
    if (isTyping) return;
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognizerRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateCompliancePDF = (msg) => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38); // Red
      doc.text("INTELLIPLANT - REGULATORY AUDIT FLAG", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date(msg.timestamp).toLocaleString()}`, 20, 30);
      doc.text(`Tracking ID: AUDIT-${msg.id.slice(-6)}`, 20, 35);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 40, 190, 40);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      // Clean up markdown hashes/stars for simple text PDF
      const cleanContent = msg.content.replace(/[*#]/g, '');
      const splitText = doc.splitTextToSize(cleanContent, 170);
      doc.text(splitText, 20, 50);
      
      if (msg.citations && msg.citations.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235);
        const yOffset = 50 + (splitText.length * 6) + 10;
        doc.text("Evidentiary Sources:", 20, yOffset);
        msg.citations.forEach((cite, idx) => {
          doc.text(`[${idx + 1}] ${cite}`, 20, yOffset + 5 + (idx * 5));
        });
      }
      
      doc.save(`Compliance_Report_${msg.id.slice(-4)}.pdf`);
    });
  };

  const agents = [
    { id: 'COPILOT', label: 'Copilot Agent', icon: Brain, description: 'General Knowledge AI Assistant' },
    { id: 'RCA', label: 'RCA Agent', icon: Wrench, description: 'Root Cause Analysis & Diagnostics' },
    { id: 'COMPLIANCE', label: 'Compliance Agent', icon: ShieldCheck, description: 'Regulatory & Safety Compliance' }
  ];

  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0];
  const CurrentAgentIcon = currentAgent.icon;

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) {
      alert("Please type a message or attach a document before sending.");
      return;
    }
    
    // Build query — if file attached, append context about it
    const queryText = attachedFile
      ? `${input.trim() ? input : 'Analyze this document:'} [Attached file: ${attachedFile.name}]`
      : input;
    
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input || `📎 ${attachedFile.name}`,
      attachment: attachedFile ? attachedFile.name : null,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    try {
      const data = await queryAgent(queryText, selectedAgent, sessionId);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        agent: selectedAgent,
        citations: data.citations || [],
        confidence: data.confidence || 0,
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
      {/* Center: Chat View */}
      <section className="flex-1 bg-slate-50 flex flex-col relative">
        {/* Session Header */}
        <div className="h-12 border-b border-[#e2e8f0] bg-white flex items-center px-6 justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">

            <span className="text-[10px] text-[#64748b] bg-slate-100 px-2 py-0.5 border border-[#e2e8f0]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {sessionId || 'LOADING...'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShareSession}
              className="text-xs font-bold hover:underline flex items-center gap-1 transition-colors"
              style={{ color: copySuccess ? '#10b981' : '#2563eb' }}
            >
              <Share2 size={12} />{copySuccess ? ' COPIED!' : ' SHARE SESSION'}
            </button>
          </div>
        </div>

        {/* Chat Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-64 text-[#64748b] space-y-4">
                <Brain size={48} className="text-[#cbd5e1]" />
                <p className="text-sm font-medium">Hello User. Select an agent below and ask your question.</p>
              </div>
            )}

            {messages.map((msg) => {
              const msgAgent = agents.find(a => a.id === msg.agent) || agents[0];
              const MsgIcon = msgAgent.icon;

              return (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' ? (
                    <div className="w-9 h-9 bg-[#2563eb] flex items-center justify-center shrink-0">
                      <MsgIcon size={18} className="text-white" />
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
                          <span className="text-xs font-bold text-[#1e293b]">INTELLIPLANT AI - {msgAgent.label.toUpperCase()}</span>
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 font-bold border border-blue-100 uppercase">
                            {msgAgent.id} ACTIVE
                          </span>
                          {msg.confidence > 0 && (
                            <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 font-bold border border-green-200">
                              {msg.confidence}% CONFIDENCE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748b]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}

                    <div className={`space-y-4 text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : msg.isError ? 'text-red-600' : 'text-[#1e293b]'}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#e2e8f0]">
                        <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Sources</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cite, idx) => (
                            <span key={idx} 
                              onClick={() => alert(`Simulated: Opening source document '${cite}'`)}
                              className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] text-slate-700 font-medium hover:bg-slate-200 cursor-pointer transition-colors">
                              <FileText size={10} className="text-[#2563eb]" />
                              {cite}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.agent === 'COMPLIANCE' && (
                      <button 
                        onClick={() => generateCompliancePDF(msg)}
                        className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 text-[10px] font-bold hover:bg-red-100 transition-colors tracking-widest uppercase"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        <ShieldCheck size={12} /> Generate Compliance Evidence (PDF)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-[#2563eb] flex items-center justify-center shrink-0">
                  <CurrentAgentIcon size={18} className="text-white animate-pulse" />
                </div>
                <div className="flex-1 bg-white border border-[#e2e8f0] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#1e293b]">INTELLIPLANT AI - {currentAgent.label.toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-[#64748b] animate-pulse">Analyzing...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area with Agent Selector */}
        <div className="p-6 bg-white border-t border-[#e2e8f0] relative">
          <div className="max-w-4xl mx-auto">
            {/* Agent Selector */}
            <div className="relative mb-2 inline-block z-20">
              <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-2 bg-slate-50 border border-[#e2e8f0] px-3 py-1.5 text-xs font-bold text-[#1e293b] hover:bg-slate-100 transition-colors"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                <CurrentAgentIcon size={14} className="text-[#2563eb]" />
                {currentAgent.label}
                <ChevronDown size={14} className="text-[#64748b]" />
              </button>

              {isSelectorOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-[#e2e8f0] shadow-lg flex flex-col">
                  {agents.map(agent => {
                    const Icon = agent.icon;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(agent.id);
                          setIsSelectorOpen(false);
                        }}
                        className={`flex items-start gap-3 p-3 text-left hover:bg-slate-50 transition-colors ${selectedAgent === agent.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <Icon size={16} className={`mt-0.5 ${selectedAgent === agent.id ? 'text-[#2563eb]' : 'text-[#64748b]'}`} />
                        <div>
                          <div className={`text-xs font-bold ${selectedAgent === agent.id ? 'text-[#2563eb]' : 'text-[#1e293b]'}`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                            {agent.label}
                          </div>
                          <div className="text-[10px] text-[#64748b] leading-snug mt-1">
                            {agent.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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
                placeholder={`Ask the ${currentAgent.label} or type a command...`}
                disabled={isTyping}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-3">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.xlsx"
                  onChange={handleAttach}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach a file"
                  className={`transition-colors ${attachedFile ? 'text-[#2563eb]' : 'text-[#64748b] hover:text-[#2563eb]'}`}
                >
                  <Paperclip size={16} />
                </button>
                {voiceSupported && (
                  <button
                    onClick={handleVoiceInput}
                    disabled={isTyping}
                    title={isListening ? 'Listening… click to stop' : 'Voice input'}
                    className={`transition-colors disabled:opacity-40 ${
                      isListening ? 'text-red-500 animate-pulse' : 'text-[#64748b] hover:text-[#2563eb]'
                    }`}
                  >
                    <Mic size={16} />
                  </button>
                )}
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="bg-[#2563eb] text-white px-4 py-1.5 text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  SEND
                </button>
              </div>
            </div>
            
            {/* Attached file pill */}
            {attachedFile && (
              <div className="mt-1.5 px-1 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] text-[#2563eb] font-bold">
                  <Paperclip size={10} />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{attachedFile.name}</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="ml-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-2 flex justify-between items-center px-1">
              <div className="flex gap-4 text-[10px] font-bold text-[#64748b] uppercase tracking-tighter" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500" /> RAG ONLINE
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500" /> MULTI-AGENT ROUTER
                </span>
              </div>
              <div className="text-[10px] text-[#64748b] italic">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Sidebar - Context Insights */}
      <aside className="w-80 bg-white border-l border-[#e2e8f0] flex flex-col hidden lg:flex">
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
