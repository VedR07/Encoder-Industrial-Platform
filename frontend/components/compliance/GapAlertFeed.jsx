'use client';

import React, { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { mockGapAlerts } from '../../data/complianceData';
import StatusBadge from '../ui/StatusBadge';
import { queryAgent } from '../../lib/api';

export default function GapAlertFeed() {
  const [complianceQuery, setComplianceQuery] = useState('');
  const [complianceResponse, setComplianceResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplianceQuery = async () => {
    if (!complianceQuery.trim()) return;
    setIsLoading(true);
    setComplianceResponse(null);
    try {
      const data = await queryAgent(complianceQuery);
      setComplianceResponse({ text: data.response, error: false });
    } catch (err) {
      setComplianceResponse({ text: `[CONNECTION ERROR] ${err.message}`, error: true });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="ink-panel p-5 grid-bg font-mono flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
        <AlertCircle size={14} className="text-[#ef4444]" />
        <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
          Regulatory Gap Alerts
        </h3>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
        {mockGapAlerts.map((gap) => (
          <div
            key={gap.id}
            className="border border-zinc-900 bg-[#0d1117]/80 hover:border-zinc-800 p-2.5 flex flex-col gap-1.5 text-[10px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[#ef4444] font-bold">{gap.standard}</span>
                <span className="text-zinc-600 font-semibold">{gap.clauseRef}</span>
              </div>
              <StatusBadge status={gap.severity} />
            </div>

            <p className="text-zinc-300 font-sans leading-relaxed text-[11px]">
              {gap.description}
            </p>

            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1 border-t border-zinc-900/60 mt-1">
              <span>Area: {gap.affectedArea}</span>
              {gap.assignedTo && <span className="text-zinc-400">Assigned: {gap.assignedTo}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* AI Compliance Query Panel */}
      <div className="mt-4 pt-4 border-t border-zinc-900">
        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">AI Compliance Query</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={complianceQuery}
            onChange={(e) => setComplianceQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComplianceQuery()}
            placeholder="Ask about a regulation or standard..."
            className="flex-1 bg-[#0d1117] border border-zinc-800 text-[11px] px-3 py-2 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#ef4444]"
          />
          <button
            onClick={handleComplianceQuery}
            disabled={isLoading}
            className="px-3 py-2 bg-[#ef4444] text-zinc-950 font-bold hover:bg-red-500 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? '...' : <Send size={12} />}
          </button>
        </div>
        {complianceResponse && (
          <div className={`mt-3 p-3 border text-[11px] leading-relaxed font-sans ${
            complianceResponse.error ? 'border-zinc-800 text-zinc-500' : 'border-zinc-800 bg-[#0d1117] text-zinc-300'
          }`}>
            {complianceResponse.text}
          </div>
        )}
      </div>
    </div>
  );
}
