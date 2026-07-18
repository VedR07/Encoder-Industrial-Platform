import React from 'react';
import { Activity, Clock, ShieldAlert, Zap, TrendingDown } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import ConfidenceMeter from '../ui/ConfidenceMeter';

export default function PredictiveCard({ recommendation }) {
  if (!recommendation) return null;
  const rec = recommendation;

  return (
    <div className="ink-panel hover:border-zinc-700 p-5 relative overflow-hidden group flex flex-col bg-[#111827] grid-bg">
      {/* Priority indicator top bar */}
      <div
        className={`absolute top-0 left-0 w-full h-[3px] ${
          rec.priority === 'Critical'
            ? 'bg-[#ef4444] shadow-[0_0_8px_#ef4444]'
            : rec.priority === 'High'
            ? 'bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]'
            : 'bg-blue-500'
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-1 font-mono">
        <div className="min-w-0 pr-4">
          <h4 className="text-[12px] font-bold text-zinc-100 truncate uppercase">
            {rec.equipment}
          </h4>
          <p className="text-[9px] text-zinc-500 mt-1 font-semibold">
            TAG: {rec.assetId}
          </p>
        </div>
        <StatusBadge status={rec.priority} label={rec.priority} />
      </div>

      {/* Action Recommendation Block */}
      <div className="bg-[#0c0f19] border border-[#1f2937] p-3 mb-4 rounded-none">
        <div className="flex items-center gap-1.5 mb-2 font-mono">
          <Zap size={11} className="text-[#f59e0b] animate-pulse" />
          <span className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">
            AI Diagnosis Path
          </span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed font-sans font-medium">
          {rec.recommendedAction}
        </p>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-5 font-mono text-[10px]">
        <div>
          <span className="text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-semibold">
            <Clock size={11} /> Forecast Window
          </span>
          <p className="text-zinc-300 font-bold mt-1">
            {new Date(rec.failureWindow.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(rec.failureWindow.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div>
          <span className="text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-semibold">
            <ShieldAlert size={11} /> Est. Risk Saved
          </span>
          <p className="text-emerald-400 font-bold mt-1">
            {rec.estimatedCostSaving}
          </p>
        </div>
        <div className="col-span-2">
          <ConfidenceMeter value={rec.confidenceScore} size="sm" showLabel={true} />
        </div>
      </div>

      {/* Footer Schedule Action */}
      <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between font-mono">
        <span className="text-[9px] text-zinc-500 italic max-w-[55%] truncate" title={rec.riskIfDeferred}>
          Risk: {rec.riskIfDeferred}
        </span>
        <button className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[#ef4444] font-bold text-[10px] transition-colors cursor-pointer rounded-none uppercase">
          Schedule Downtime
        </button>
      </div>
    </div>
  );
}
