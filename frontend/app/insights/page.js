'use client';

import React, { useState } from 'react';
import { 
  Globe2, AlertTriangle, ShieldCheck, ArrowRight,
  TrendingUp, AlertOctagon, Lightbulb, Factory,
  ChevronRight, Filter
} from 'lucide-react';

const insights = [
  {
    id: 1,
    sourcePlant: 'Refinery Alpha (Mumbai)',
    targetPlant: 'Chemicals Beta (Gujarat)',
    type: 'predictive_failure',
    title: 'Mechanical Seal Degradation in High-Temp Centrifugal Pumps',
    description: 'RCA Agent identified a pattern of mechanical seal failures in P-103A pumps operating above 140°C. 4 similar pumps at Chemicals Beta are currently operating in this temperature range and have not been inspected in 6+ months.',
    action: 'Generate Preventive Maintenance Work Orders for Beta Plant',
    status: 'action_required',
    impact: 'Prevents 18-22 hours of unplanned downtime',
    matchScore: 94
  },
  {
    id: 2,
    sourcePlant: 'Polymer Facility (Chennai)',
    targetPlant: 'All Facilities',
    type: 'compliance_update',
    title: 'OISD Directive 114: Pressure Safety Valve Recalibration',
    description: 'Recent audit at Chennai facility highlighted a new OISD interpretation requiring monthly (vs quarterly) recalibration for PSVs on volatile feed lines. The Knowledge Graph has flagged 42 valves across 3 other plants that are now out of compliance.',
    action: 'Auto-schedule Recalibration Routes',
    status: 'in_progress',
    impact: 'Mitigates critical regulatory audit failure',
    matchScore: 98
  },
  {
    id: 3,
    sourcePlant: 'Refinery Alpha (Mumbai)',
    targetPlant: 'LNG Terminal (Kochi)',
    type: 'efficiency_gain',
    title: 'Optimized Fuel-Mix Ratio for Steam Generators',
    description: 'Copilot agent optimization of steam generator fuel-mix during high humidity conditions yielded a 1.2% efficiency gain at Alpha. Conditions and equipment at Kochi terminal match this profile.',
    action: 'Apply Setpoint Optimization to Kochi DCS',
    status: 'applied',
    impact: 'Estimated $45,000 annual fuel savings',
    matchScore: 88
  }
];

export default function GlobalInsightsPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col bg-[#f8fafc] overflow-y-auto custom-scroll">
      {/* Header */}
      <div className="border-b border-[#e2e8f0] bg-white px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-sm border border-blue-100">
            <Globe2 size={24} className="text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e293b] tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Cross-Plant Lessons Learned
            </h1>
            <p className="text-xs text-[#64748b] mt-1">
              AI-driven systemic failure prediction and intelligence sharing across the enterprise fleet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mr-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Filter By:
          </span>
          <select 
            className="text-xs bg-slate-50 border border-[#e2e8f0] px-3 py-1.5 focus:outline-none focus:border-[#2563eb]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Insights</option>
            <option value="action_required">Action Required</option>
            <option value="in_progress">In Progress</option>
            <option value="applied">Applied</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-5xl mx-auto w-full flex-1">
        
        <div className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Active Systemic Patterns Detected
          </h2>
          
          <div className="space-y-6">
            {insights.filter(i => filter === 'all' || i.status === filter).map(insight => {
              
              const isAlert = insight.type === 'predictive_failure';
              const isCompliance = insight.type === 'compliance_update';
              const isEfficiency = insight.type === 'efficiency_gain';
              
              const Icon = isAlert ? AlertOctagon : isCompliance ? ShieldCheck : TrendingUp;
              const accentColor = isAlert ? '#ef4444' : isCompliance ? '#f59e0b' : '#10b981';
              const bgLight = isAlert ? 'bg-red-50' : isCompliance ? 'bg-amber-50' : 'bg-emerald-50';
              const borderLight = isAlert ? 'border-red-200' : isCompliance ? 'border-amber-200' : 'border-emerald-200';

              return (
                <div key={insight.id} className="clean-card bg-white border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Left Column: Match & Source */}
                  <div className={`md:w-64 p-6 border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col justify-between ${bgLight}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon size={18} style={{ color: accentColor }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor, fontFamily: '"JetBrains Mono", monospace' }}>
                          {insight.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-[9px] uppercase tracking-widest text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Origin</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e293b] mt-0.5">
                          <Factory size={12} className="text-[#64748b]" /> {insight.sourcePlant}
                        </div>
                      </div>
                      <div className="my-3 flex justify-center">
                        <ArrowRight size={16} className="text-[#94a3b8]" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Target</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e293b] mt-0.5">
                          <Factory size={12} className="text-[#64748b]" /> {insight.targetPlant}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`mt-6 p-3 bg-white border ${borderLight} text-center`} title="Simulated for demo">
                      <span className="block text-[10px] uppercase font-bold text-[#64748b] mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Graph Match Score</span>
                      <span className="text-xl font-bold" style={{ color: accentColor }}>{insight.matchScore}%</span>
                    </div>
                  </div>

                  {/* Right Column: Details & Action */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-2 leading-tight">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed mb-6">
                      {insight.description}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 border border-slate-100">
                        <Lightbulb size={14} className="text-[#2563eb]" />
                        <span className="text-xs font-medium text-[#1e293b]">
                          <span className="font-bold">Business Impact:</span> {insight.impact}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => insight.status !== 'applied' && alert(`Simulated: ${insight.action}`)}
                          className={`flex items-center gap-2 px-6 py-2 text-xs font-bold text-white transition-colors ${
                          insight.status === 'applied' ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-blue-700'
                        }`}>
                          {insight.status === 'applied' ? 'Action Applied' : insight.action}
                          {insight.status !== 'applied' && <ChevronRight size={14} />}
                        </button>
                        
                        {insight.status === 'action_required' && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-widest animate-pulse" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                            <AlertTriangle size={12} /> Pending Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
