import React from 'react';
import * as Icons from 'lucide-react';

export default function MetricCard({ label, value, unit, trend, trendValue, trendIsPositive, iconName, sparkline }) {
  const IconComponent = iconName ? Icons[iconName] : null;

  return (
    <div className="ink-panel p-4 flex flex-col justify-between relative overflow-hidden grid-bg">
      {/* Absolute indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-right from-transparent via-[#f59e0b]/40 to-transparent" />
      
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
          {label}
        </span>
        {IconComponent && (
          <div className="text-zinc-500">
            <IconComponent size={14} className="stroke-[1.5]" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tracking-tighter text-zinc-100">
              {value}
            </span>
            {unit && (
              <span className="text-[11px] font-mono text-zinc-500 uppercase ml-0.5">
                {unit}
              </span>
            )}
          </div>

          {(trend || trendValue) && (
            <div className="flex items-center gap-1 mt-1 font-mono text-[10px]">
              <span
                className={`font-semibold ${
                  trendIsPositive === true
                    ? 'text-emerald-400'
                    : trendIsPositive === false
                    ? 'text-red-400'
                    : 'text-zinc-500'
                }`}
              >
                {trendValue} {trend}
              </span>
            </div>
          )}
        </div>

        {sparkline && sparkline.length > 0 && (
          <div className="flex items-end gap-[1px] h-8 w-16 opacity-40">
            {sparkline.map((val, idx) => {
              const max = Math.max(...sparkline);
              const height = max > 0 ? (val / max) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[2px] bg-zinc-500 hover:bg-[#f59e0b] transition-all duration-150"
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
