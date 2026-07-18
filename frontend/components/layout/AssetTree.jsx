'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, HardHat, Disc } from 'lucide-react';

const assetStatusColors = {
  operational: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Operational' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-400', label: 'Warning' },
  alert: { dot: 'bg-orange-500', text: 'text-orange-400', label: 'Alert' },
  critical: { dot: 'bg-red-500', text: 'text-red-400', label: 'Critical' },
  maintenance: { dot: 'bg-blue-500', text: 'text-blue-400', label: 'In Maintenance' },
  offline: { dot: 'bg-slate-500', text: 'text-slate-400', label: 'Offline' },
};

export default function AssetTree({ onSelectAsset, selectedAssetId, assets = [] }) {
  const [expandedNodes, setExpandedNodes] = useState({
    'plant-alpha': true,
    'area-processing': true,
    'unit-comp': true,
  });

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedAssetId === node.id || selectedAssetId === node.assetTag;
    const statusColor = assetStatusColors[node.status] || { dot: 'bg-zinc-500', text: 'text-zinc-500' };

    return (
      <div key={node.id} className="select-none font-mono">
        <div
          onClick={() => {
            if (node.type === 'equipment' && onSelectAsset) {
              onSelectAsset(node);
            } else if (hasChildren) {
              toggleNode(node.id);
            }
          }}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          className={`
            flex items-center gap-1.5 py-1 pr-2 text-[11px] cursor-pointer border-l-2
            ${isSelected 
              ? 'bg-[#111827] text-zinc-100 border-l-[#ef4444]' 
              : 'text-zinc-400 border-l-transparent hover:bg-[#111827]/40 hover:text-zinc-200'}
          `}
        >
          {/* Collapse/Expand Icon */}
          <span className="w-3 h-3 flex items-center justify-center text-zinc-600">
            {hasChildren ? (
              isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />
            ) : null}
          </span>

          {/* Status Dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot} shadow-[0_0_4px_currentColor]`} />

          {/* Node Label */}
          <span className={`truncate ${node.type === 'equipment' ? 'font-semibold' : 'text-zinc-500'}`}>
            {node.label}
          </span>

          {/* Asset tag badge */}
          {node.assetTag && (
            <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1 py-0.2 rounded-none ml-auto scale-90">
              {node.assetTag}
            </span>
          )}
        </div>

        {/* Render children recursively */}
        {hasChildren && isExpanded && (
          <div className="border-l border-zinc-900/60 ml-2.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]/80 border-r border-[#1f2937] w-64 overflow-y-auto">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1f2937] flex-shrink-0 bg-[#0d1117]">
        <Disc size={12} className="text-[#ef4444] animate-spin-slow" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
          Asset Topology Tree
        </span>
      </div>
      <div className="flex-1 py-2 overflow-y-auto">
        {assets.map((plant) => renderNode(plant))}
      </div>
    </div>
  );
}
