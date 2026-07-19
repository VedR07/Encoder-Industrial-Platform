'use client';

import React, { useState, useMemo } from 'react';
import { assetTreeData, assetStatusColors } from '../../data/assetTreeData';
import { ChevronDown, ChevronRight, HardHat, Disc } from 'lucide-react';

// Override status colors for light theme
const lightStatusColors = {
  operational: { dot: 'bg-emerald-500', text: 'text-emerald-600' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-600' },
  alert: { dot: 'bg-orange-500', text: 'text-orange-600' },
  critical: { dot: 'bg-red-500', text: 'text-red-600' },
  maintenance: { dot: 'bg-violet-500', text: 'text-violet-600' },
};

export default function AssetTree({ onSelectAsset, selectedAssetId }) {
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
    const statusColor = lightStatusColors[node.status] || assetStatusColors[node.status] || { dot: 'bg-slate-400', text: 'text-slate-400' };

    return (
      <div key={node.id} className="select-none">
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
            flex items-center gap-1.5 py-1.5 pr-2 text-[11px] cursor-pointer border-l-2 transition-colors
            ${isSelected 
              ? 'bg-[#0d7377]/8 text-[#0d7377] border-l-[#0d7377] font-semibold' 
              : 'text-slate-600 border-l-transparent hover:bg-slate-100/60 hover:text-slate-800'}
          `}
        >
          {/* Collapse/Expand Icon */}
          <span className="w-3 h-3 flex items-center justify-center text-slate-400">
            {hasChildren ? (
              isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />
            ) : null}
          </span>

          {/* Status Dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />

          {/* Node Label */}
          <span className={`truncate ${node.type === 'equipment' ? 'font-medium text-slate-700' : 'text-slate-500'}`}>
            {node.label}
          </span>

          {/* Asset tag badge */}
          {node.assetTag && (
            <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-500 px-1 py-0.5 rounded ml-auto">
              {node.assetTag}
            </span>
          )}
        </div>

        {/* Render children recursively */}
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 ml-2.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#e2e0dc] w-64 overflow-y-auto">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e2e0dc] flex-shrink-0 bg-white">
        <div className="w-5 h-5 rounded flex items-center justify-center bg-[#0d7377]/10">
          <Disc size={11} className="text-[#0d7377]" />
        </div>
        <span className="text-[11px] font-semibold tracking-wide text-slate-600">
          Asset Topology Tree
        </span>
      </div>
      <div className="flex-1 py-2 overflow-y-auto">
        {assetTreeData.map((plant) => renderNode(plant))}
      </div>
    </div>
  );
}
