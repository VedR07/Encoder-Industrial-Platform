'use client';

import React, { useState } from 'react';
import { 
  Database, Activity, Server, ShieldCheck, CheckCircle2, 
  AlertCircle, RefreshCw, Power, Settings2, ArrowRight
} from 'lucide-react';

const integrationsList = [
  {
    id: 'sap',
    name: 'SAP Plant Maintenance (PM)',
    category: 'ERP & Asset Management',
    description: 'Two-way sync for work orders, equipment hierarchy, and maintenance schedules.',
    status: 'connected',
    lastSync: '2 mins ago',
    icon: Database,
    color: '#0ea5e9' // sky-500
  },
  {
    id: 'maximo',
    name: 'IBM Maximo',
    category: 'EAM',
    description: 'Ingest asset failure codes, historical maintenance logs, and spare parts inventory.',
    status: 'disconnected',
    lastSync: 'Never',
    icon: Server,
    color: '#3b82f6' // blue-500
  },
  {
    id: 'mindsphere',
    name: 'Siemens MindSphere',
    category: 'IoT & Telemetry',
    description: 'Real-time streaming telemetry, PLC fault codes, and edge device diagnostics.',
    status: 'connected',
    lastSync: 'Live',
    icon: Activity,
    color: '#0d9488' // teal-600
  },
  {
    id: 'osisoft',
    name: 'OSIsoft PI System',
    category: 'SCADA Historian',
    description: 'High-frequency time-series data ingestion for predictive modeling.',
    status: 'syncing',
    lastSync: 'Sync in progress...',
    icon: Activity,
    color: '#8b5cf6' // violet-500
  },
  {
    id: 'qms',
    name: 'TrackWise QMS',
    category: 'Quality & Compliance',
    description: 'Audit trails, CAPA workflows, and regulatory non-conformance reports.',
    status: 'connected',
    lastSync: '1 hour ago',
    icon: ShieldCheck,
    color: '#f59e0b' // amber-500
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(integrationsList);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleConnection = (id) => {
    setIntegrations(integrations.map(integration => {
      if (integration.id === id) {
        const isConnecting = integration.status === 'disconnected' || integration.status === 'error';
        return {
          ...integration,
          status: isConnecting ? 'syncing' : 'disconnecting',
          lastSync: isConnecting ? 'Connecting...' : 'Disconnecting...'
        };
      }
      return integration;
    }));

    // Simulate connection delay and error case
    const target = integrations.find(i => i.id === id);
    if (target) {
      const isConnecting = target.status === 'disconnected' || target.status === 'error';
      setTimeout(() => {
        setIntegrations(current => current.map(integration => {
          if (integration.id === id) {
            // 20% chance to fail on connect
            if (isConnecting && Math.random() < 0.2) {
              return { ...integration, status: 'error', lastSync: 'Connection failed' };
            }
            return { 
              ...integration, 
              status: isConnecting ? 'connected' : 'disconnected', 
              lastSync: isConnecting ? 'Just now' : 'Never' 
            };
          }
          return integration;
        }));
      }, 2000);
    }
  };

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIntegrations(current => current.map(integration => 
        integration.status === 'connected'
          ? { ...integration, lastSync: 'Just now' }
          : integration
      ));
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col bg-[#f8fafc] overflow-y-auto custom-scroll">
      {/* Header */}
      <div className="border-b border-[#e2e8f0] bg-white px-8 py-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Enterprise Integration Hub
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Connect your existing ERP, EAM, and SCADA systems to feed the Knowledge Graph.
          </p>
        </div>
        <button 
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white border border-[#e2e8f0] px-4 py-2 text-xs font-bold text-[#1e293b] hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> 
          Sync All Active
        </button>
      </div>

      {/* Grid Area */}
      <div className="p-8 max-w-6xl mx-auto w-full flex-1">
        
        {/* Architecture visualization banner */}
        <div className="mb-8 p-6 bg-slate-900 rounded-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          </div>
          <div className="relative z-10">
            <h2 className="text-white font-bold text-lg mb-1">Universal Middleware Architecture</h2>
            <p className="text-slate-400 text-xs max-w-xl">
              IntelliPlant does not replace your systems; it reads from them. Our zero-ETL pipeline ingests 
              structured and unstructured data from these sources to build a unified operational Knowledge Graph.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 text-slate-300">
            <div className="text-center">
              <Database size={24} className="mx-auto mb-1 text-slate-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Sources</span>
            </div>
            <ArrowRight size={16} className="text-[#2563eb] animate-pulse" />
            <div className="text-center p-3 border border-[#2563eb]/30 bg-[#2563eb]/10">
              <span className="text-xs font-bold text-[#3b82f6]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>IntelliPlant API</span>
            </div>
            <ArrowRight size={16} className="text-[#2563eb] animate-pulse" />
            <div className="text-center">
              <Activity size={24} className="mx-auto mb-1 text-slate-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Graph</span>
            </div>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.status === 'connected';
            const isSyncing = integration.status === 'syncing' || integration.status === 'disconnecting';
            const isError = integration.status === 'error';
            
            return (
              <div key={integration.id} className="clean-card p-6 flex flex-col bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-sm">
                      <Icon size={24} style={{ color: integration.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e293b] text-sm">{integration.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {integration.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        <CheckCircle2 size={12} /> Connected
                      </span>
                    )}
                    {isSyncing && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        <RefreshCw size={12} className="animate-spin" /> Syncing
                      </span>
                    )}
                    {isError && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        <AlertCircle size={12} /> Error
                      </span>
                    )}
                    {!isConnected && !isSyncing && !isError && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        <AlertCircle size={12} /> Disconnected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#475569] mb-6 flex-1">
                  {integration.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      Last Sync:
                    </span>
                    <span className="text-xs text-[#1e293b] font-medium">
                      {integration.lastSync}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <button className="text-[#64748b] hover:text-[#1e293b] transition-colors p-1">
                        <Settings2 size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => toggleConnection(integration.id)}
                      disabled={isSyncing}
                      className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all ${
                        isConnected 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                          : 'bg-[#2563eb] text-white hover:bg-blue-700'
                      }`}
                    >
                      <Power size={12} />
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
