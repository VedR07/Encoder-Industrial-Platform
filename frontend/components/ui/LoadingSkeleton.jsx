import React from 'react';

export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'ticker') {
    return (
      <div className="flex gap-2 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-6 w-32 bg-zinc-900 border border-zinc-800 animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full bg-zinc-900 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="ink-panel p-5 space-y-4 animate-pulse">
      <div className="h-4 bg-zinc-900 w-1/3" />
      <div className="space-y-2">
        <div className="h-2 bg-zinc-900 w-full" />
        <div className="h-2 bg-zinc-900 w-5/6" />
        <div className="h-2 bg-zinc-900 w-4/5" />
      </div>
      <div className="pt-4 flex justify-between">
        <div className="h-6 bg-zinc-900 w-16" />
        <div className="h-6 bg-zinc-900 w-24" />
      </div>
    </div>
  );
}
