'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Send, Terminal, Sparkles, BookOpen } from 'lucide-react';
import ConfidenceMeter from '../ui/ConfidenceMeter';
import { queryAgent } from '../../lib/api';
import { mockConversation, suggestedQueries, mockDocuments } from '../../data/copilotData';

export default function ChatInterface({ onCitationClick }) {
  const [messages, setMessages] = useState(mockConversation);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `MSG-USR-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await queryAgent(text);
      const aiMsg = {
        id: `MSG-AI-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: `MSG-ERR-${Date.now()}`,
        role: 'assistant',
        content: `[CONNECTION ERROR] Could not reach the AI backend. Please ensure the server is running. (${err.message})`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleCitationClick = useCallback((cit) => {
    // Find document matching citations and fire onCitationClick
    const doc = mockDocuments.find(d => d.id === cit.documentId);
    if (doc && onCitationClick) {
      onCitationClick(doc);
    }
  }, [onCitationClick]);

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-[#1f2937] font-mono">
      {/* Console Header */}
      <div className="px-4 py-2 border-b border-[#1f2937] bg-[#0d1117] flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Terminal size={12} className="text-[#ef4444]" />
          <span>Intelliprompt Terminal v3.4.2</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>RAG PIPELINE STABLE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            {/* Metadata bar */}
            <span className="text-[9px] font-mono text-zinc-600 mb-1">
              {msg.role === 'user' ? 'OPERATOR' : 'AI ENGINE'} • {new Date(msg.timestamp).toLocaleTimeString()}
            </span>

            {/* Bubble */}
            <div
              className={`p-3 border text-[12px] leading-relaxed select-text ${
                msg.role === 'user'
                  ? 'bg-[#111827] border-[#1f2937] text-zinc-100'
                  : 'bg-[#0d1117] border-[#1f2937] text-zinc-300'
              }`}
            >
              {msg.content}

              {/* Citations & Confidence Badge */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-900 flex flex-col gap-2">
                  {/* Confidence meter */}
                  {msg.overallConfidence && (
                    <ConfidenceMeter value={msg.overallConfidence} size="sm" showLabel={true} />
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mt-1 font-mono text-[9px]">
                    <span className="text-zinc-500 mr-1 flex items-center gap-1">
                      <BookOpen size={10} /> Sources:
                    </span>
                    {msg.citations.map((cit) => (
                      <button
                        key={cit.id}
                        onClick={() => handleCitationClick(cit)}
                        className="bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#ef4444] text-zinc-400 hover:text-zinc-100 px-1.5 py-0.5 transition-colors cursor-pointer"
                      >
                        {cit.documentTitle.split(':')[0]} • Sec {cit.pageNumber || 'A'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
            <Sparkles size={12} className="animate-spin text-[#f59e0b]" />
            <span>AI generating reasoning paths...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts list */}
      <div className="px-4 py-2 border-t border-zinc-900 bg-[#0d1117]/30 flex gap-1.5 overflow-x-auto whitespace-nowrap">
        {suggestedQueries.slice(0, 3).map((query, i) => (
          <button
            key={i}
            onClick={() => handleSend(query)}
            className="text-[9px] text-zinc-500 hover:text-zinc-300 border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 px-2 py-0.5 transition-colors cursor-pointer"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="p-3 border-t border-[#1f2937] bg-[#0d1117] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask AI engine for procedural manuals..."
          className="flex-1 bg-[#111827] border border-[#1f2937] text-[11px] px-3 py-2 text-zinc-300 placeholder-zinc-600 rounded-none focus:outline-none focus:border-[#ef4444]"
        />
        <button
          onClick={() => handleSend(input)}
          className="px-3 py-2 bg-[#ef4444] text-zinc-950 font-bold hover:bg-red-500 hover:shadow-[0_0_8px_var(--vermilion)] transition-all cursor-pointer rounded-none"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
