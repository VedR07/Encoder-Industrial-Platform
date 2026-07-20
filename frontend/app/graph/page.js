'use client';

import React, { useState, useMemo, useRef } from 'react';
import OntologyGraph from '../../components/OntologyGraph';
import { graphData as initialGraphData } from './data';
import { uploadDocument } from '../../lib/api';
import { Filter, RefreshCw, Network, UploadCloud } from 'lucide-react';

export default function GraphExplorer() {
  const [selectedGroups, setSelectedGroups] = useState({
    Hardware: true,
    Software: true,
    Fault: true,
    Document: true,
    Agent: true
  });
  
  const [graphData, setGraphData] = useState(initialGraphData);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Filter data based on selected groups
  const filteredData = useMemo(() => {
    const nodes = graphData.nodes.filter(n => selectedGroups[n.group]);
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l => nodeIds.has(l.source.id || l.source) && nodeIds.has(l.target.id || l.target));
    return { nodes, links };
  }, [graphData, selectedGroups]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(`Parsing ${file.name}...`);
    
    try {
      const res = await uploadDocument(file);
      setUploadStatus(res.message);
      
      // Inject new nodes and links into graph
      setGraphData(prev => ({
        nodes: [...prev.nodes, ...res.extracted_nodes],
        links: [...prev.links, ...res.extracted_links]
      }));
      
      // Clear status after 3s
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      setUploadStatus('Ingestion failed.');
      setTimeout(() => setUploadStatus(''), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleGroup = (group) => {
    setSelectedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    setSelectedNode(null); // Clear selection when filtering
  };

  const handleNodeClick = (node) => {
    // Determine connected nodes and edges for details
    const connectedLinks = filteredData.links.filter(l => l.source.id === node.id || l.target.id === node.id);
    
    setSelectedNode({
      ...node,
      connections: connectedLinks.map(l => ({
        type: l.label,
        target: l.source.id === node.id ? l.target.id : l.source.id,
        direction: l.source.id === node.id ? 'OUT' : 'IN'
      }))
    });
  };

  const groupColors = {
    Hardware: '#2563eb',
    Software: '#8b5cf6',
    Fault: '#ef4444',
    Document: '#10b981',
    Agent: '#0f172a'
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex bg-[#f8fafc]">
      {/* Left Sidebar - Controls */}
      <div className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col p-4 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-[#1e293b]">
          <Network size={20} className="text-[#2563eb]" />
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>Graph Explorer</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Relationship Types
          </h3>
          <div className="space-y-2">
            {Object.keys(selectedGroups).map(group => (
              <label key={group} className="flex items-center gap-2 cursor-pointer text-xs text-[#1e293b]">
                <input 
                  type="checkbox" 
                  checked={selectedGroups[group]} 
                  onChange={() => toggleGroup(group)}
                  className="rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#2563eb]"
                />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: groupColors[group] }} />
                {group}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6 border-t border-[#e2e8f0] pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Graph Stats
          </h3>
          <div className="flex justify-between text-xs text-[#1e293b] mb-2">
            <span>Visible Objects</span>
            <span className="font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{filteredData.nodes.length}</span>
          </div>
          <div className="flex justify-between text-xs text-[#1e293b]">
            <span>Visible Relationships</span>
            <span className="font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{filteredData.links.length}</span>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="p-3 bg-slate-50 border border-[#e2e8f0] rounded-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Document Ingestion
            </h4>
            <p className="text-[10px] text-[#64748b] mb-3 leading-tight">
              Upload P&IDs, manuals, or maintenance logs to dynamically extract entities and update the Knowledge Graph.
            </p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.png,.jpg,.csv,.txt"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-[#2563eb] py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadCloud size={14} /> 
              {isUploading ? 'Extracting...' : 'Upload Document'}
            </button>
            {uploadStatus && (
              <p className="text-[10px] text-[#2563eb] mt-2 font-bold text-center animate-pulse" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {uploadStatus}
              </p>
            )}
          </div>

          <button 
            onClick={() => setSelectedGroups({ Hardware: true, Software: true, Fault: true, Document: true, Agent: true })}
            className="w-full border border-[#e2e8f0] py-2 text-xs font-bold text-[#1e293b] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative flex">
        <OntologyGraph data={filteredData} onNodeClick={handleNodeClick} />
        
        {/* Right Panel - Node Details overlay */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-white border border-[#e2e8f0] shadow-lg flex flex-col pointer-events-auto">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white px-2 py-0.5 rounded-sm" style={{ backgroundColor: selectedNode.color, fontFamily: '"JetBrains Mono", monospace' }}>
                  {selectedNode.group}
                </span>
                <h3 className="text-sm font-bold text-[#1e293b] mt-2">{selectedNode.id}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-[#94a3b8] hover:text-[#0f172a]">
                ✕
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 border-b border-[#e2e8f0]">
              <p className="text-xs text-[#475569] leading-relaxed italic">
                "{selectedNode.desc}"
              </p>
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-[300px] bg-[#f8fafc]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Relationships
              </h4>
              <ul className="space-y-3">
                {selectedNode.connections.length === 0 ? (
                  <li className="text-xs text-[#94a3b8]">No connections found.</li>
                ) : (
                  selectedNode.connections.map((conn, idx) => (
                    <li key={idx} className="text-xs flex flex-col bg-white p-2 border border-[#e2e8f0] shadow-sm">
                      <span className="text-[9px] text-[#2563eb] font-bold uppercase tracking-wider mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {conn.direction === 'OUT' ? `→ ${conn.type}` : `← ${conn.type}`}
                      </span>
                      <span className="text-[#1e293b] font-medium pl-2 border-l-2 border-[#cbd5e1]">{conn.target}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
