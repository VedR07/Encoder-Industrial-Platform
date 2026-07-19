'use client';

import React from 'react';
import { FileText, Calendar, Compass, ShieldAlert } from 'lucide-react';

export default function DocumentViewer({ document, onClose }) {
  if (!document) return null;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-[#1f2937] w-[450px] flex-shrink-0 font-mono">
      {/* Header Info */}
      <div className="p-4 border-b border-[#1f2937] flex items-start justify-between flex-shrink-0 bg-[#0d1117]">
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
            <FileText size={12} className="text-[#ef4444]" />
            <span>{document.type} Reference</span>
          </div>
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide truncate mt-1.5" title={document.title}>
            {document.title}
          </h3>
          <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider">
            OEM: {document.author} • Relevance: {document.relevanceScore}%
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-100 text-[11px] font-bold border border-zinc-800 hover:border-zinc-700 px-1.5 py-0.5 cursor-pointer"
        >
          CLOSE
        </button>
      </div>

      {/* Manual content segments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {document.sections.map((section) => (
          <div key={section.id} className="border border-zinc-900 bg-[#111827] p-3 text-[11px] font-sans">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 mb-2 font-mono text-[9px] text-[#ef4444] font-bold">
              <span>{section.title}</span>
              <span className="bg-zinc-950 px-1 border border-zinc-800">PAGE {section.page}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-justify select-text">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
