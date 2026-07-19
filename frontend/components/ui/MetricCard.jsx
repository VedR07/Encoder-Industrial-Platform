import React from 'react';
import * as Icons from 'lucide-react';

export default function MetricCard({ label, value, unit, trend, trendValue, trendIsPositive, iconName, sparkline }) {
  const IconComponent = iconName ? Icons[iconName] : null;

  return (
    <div className="clean-card p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2563eb]" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          {label}
        </span>
        {IconComponent && (
          <div className="w-7 h-7 bg-blue-50 flex items-center justify-center">
            <IconComponent size={14} className="text-[#2563eb] stroke-[1.5]" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-[#1e293b]"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {value}
            </span>
            {unit && (
              <span className="text-[11px] text-[#94a3b8] ml-0.5">
                {unit}
              </span>
            )}
          </div>

          {(trend || trendValue) && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px]">
              <span
                className={`font-semibold px-1.5 py-0.5 ${
                  trendIsPositive === true
                    ? 'text-green-700 bg-green-50 border border-green-100'
                    : trendIsPositive === false
                    ? 'text-red-700 bg-red-50 border border-red-100'
                    : 'text-slate-500 bg-slate-100 border border-slate-200'
                }`}
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {trendValue} {trend}
              </span>
            </div>
          )}
        </div>

        {sparkline && sparkline.length > 0 && (
          <div className="flex items-end gap-[2px] h-8 w-16">
            {sparkline.map((val, idx) => {
              const max = Math.max(...sparkline);
              const height = max > 0 ? (val / max) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[3px] bg-[#2563eb]/20 hover:bg-[#2563eb] transition-all duration-150"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
