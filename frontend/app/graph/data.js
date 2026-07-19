export const graphData = {
  nodes: [
    { id: 'Alpha Sector Refinery', group: 'Asset', val: 10, color: '#3b82f6', desc: 'Main facility' },
    { id: 'Compressor St. 2', group: 'Asset', val: 8, color: '#3b82f6', desc: 'Critical high-pressure compressor unit' },
    { id: 'Cooling Tower C', group: 'Asset', val: 6, color: '#3b82f6', desc: 'Primary thermal regulation tower' },
    { id: 'Primary Cracker', group: 'Asset', val: 6, color: '#3b82f6', desc: 'Main catalytic cracking unit' },
    
    { id: 'B-4 Casing Unit', group: 'Component', val: 4, color: '#8b5cf6', desc: 'Outer protective casing for compressor' },
    { id: 'Seal Assembly', group: 'Component', val: 4, color: '#8b5cf6', desc: 'High-pressure mechanical seal' },
    { id: 'Pressure Valve', group: 'Component', val: 4, color: '#8b5cf6', desc: 'Regulates internal flow' },

    { id: 'F30005', group: 'Fault', val: 6, color: '#ef4444', desc: 'Critical error code indicating severe mechanical failure or pressure drop' },
    { id: 'Vibration Anomaly', group: 'Fault', val: 5, color: '#ef4444', desc: 'Irregular oscillation outside normal operating frequency' },
    { id: 'Temp Hi', group: 'Fault', val: 4, color: '#f59e0b', desc: 'Temperature exceeding safe operational limits' },

    { id: 's71200_system_manual', group: 'Document', val: 5, color: '#10b981', desc: 'Siemens S7-1200 official system manual' },
    { id: 'OISD Guidelines', group: 'Document', val: 5, color: '#10b981', desc: 'Oil Industry Safety Directorate compliance guidelines' },
    { id: 'Factory Act', group: 'Document', val: 5, color: '#10b981', desc: 'National industrial labor and safety regulations' },

    { id: 'RCA Agent', group: 'Agent', val: 7, color: '#0f172a', desc: 'Root Cause Analysis AI Agent' },
    { id: 'Compliance Agent', group: 'Agent', val: 7, color: '#0f172a', desc: 'Regulatory and Safety Compliance AI Agent' },
    { id: 'Copilot', group: 'Agent', val: 7, color: '#0f172a', desc: 'General Knowledge AI Assistant' }
  ],
  links: [
    { source: 'Compressor St. 2', target: 'Alpha Sector Refinery', label: 'PART_OF' },
    { source: 'Cooling Tower C', target: 'Alpha Sector Refinery', label: 'PART_OF' },
    { source: 'Primary Cracker', target: 'Alpha Sector Refinery', label: 'PART_OF' },
    
    { source: 'B-4 Casing Unit', target: 'Compressor St. 2', label: 'COMPONENT_OF' },
    { source: 'Seal Assembly', target: 'B-4 Casing Unit', label: 'CONTAINED_IN' },
    
    { source: 'F30005', target: 'Compressor St. 2', label: 'AFFECTS' },
    { source: 'Vibration Anomaly', target: 'Cooling Tower C', label: 'DETECTED_ON' },
    { source: 'Temp Hi', target: 'Primary Cracker', label: 'DETECTED_ON' },
    
    { source: 'F30005', target: 's71200_system_manual', label: 'DOCUMENTED_IN' },
    { source: 'Vibration Anomaly', target: 'OISD Guidelines', label: 'VIOLATES' },
    { source: 'Temp Hi', target: 'Factory Act', label: 'REGULATED_BY' },
    
    { source: 'RCA Agent', target: 'F30005', label: 'DIAGNOSES' },
    { source: 'Compliance Agent', target: 'OISD Guidelines', label: 'ENFORCES' },
    { source: 'Copilot', target: 's71200_system_manual', label: 'KNOWS' },
    { source: 'RCA Agent', target: 'Compressor St. 2', label: 'MONITORS' }
  ]
};
