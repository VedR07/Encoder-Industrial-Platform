import React from 'react';

export default function ConfidenceMeter({ value, size = 'md', showLabel = true }) {
  // value expected as 0 to 100 or 0 to 1 (normalized internally)
  const normValue = value > 1 ? value / 100 : value;
  const percentage = Math.round(normValue * 100);

  let colorClass = 'bg-[#ef4444] shadow-[0_0_8px_#ef4444]'; // Low
  let label = 'Unverified';
  let textColor = 'text-red-400';

  if (normValue >= 0.85) {
    colorClass = 'bg-[#10b981] shadow-[0_0_8px_#10b981]'; // High
    label = 'Verified RAG';
    textColor = 'text-emerald-400';
  } else if (normValue >= 0.6) {
    colorClass = 'bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]'; // Medium
    label = 'Conditional';
    textColor = 'text-amber-400';
  }

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {showLabel && (
        <div className="flex items-center justify-between text-[10px]">
          <span className={`font-bold uppercase tracking-wider ${textColor}`}>
            {label}
          </span>
          <span className="font-bold text-zinc-100">
            {percentage}% CONFIDENCE
          </span>
        </div>
      )}
      <div
        className={`w-full bg-[#111827] border border-[#1f2937] overflow-hidden rounded-none ${
          size === 'sm' ? 'h-1' : 'h-2'
        }`}
      >
        <div
          className={`h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
