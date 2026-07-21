export const graphData = {
  nodes: [
    // Hardware (Assets)
    { id: 'S7-1200 PLC', group: 'Hardware', val: 12, color: '#334155', desc: 'Siemens SIMATIC S7-1200 Basic Controller for industrial automation' },
    { id: 'S7-1500 PLC', group: 'Hardware', val: 12, color: '#334155', desc: 'Siemens SIMATIC S7-1500 Advanced Controller for complex systems' },
    { id: 'G120C Inverter', group: 'Hardware', val: 10, color: '#334155', desc: 'Siemens SINAMICS G120C compact vector drive' },
    { id: 'Compressor St. 2', group: 'Hardware', val: 8, color: '#334155', desc: 'Critical high-pressure compressor unit driven by G120C' },

    // Software/Protocols
    { id: 'TIA Portal v16', group: 'Software', val: 10, color: '#6366f1', desc: 'Totally Integrated Automation Portal version 16' },
    { id: 'PROFINET', group: 'Software', val: 8, color: '#6366f1', desc: 'Industrial Ethernet standard for automation' },
    { id: 'MigrationTool G2', group: 'Software', val: 6, color: '#6366f1', desc: 'Tool for migrating legacy projects to TIA Portal' },

    // Faults/Errors
    { id: 'F30005', group: 'Fault', val: 8, color: '#e11d48', desc: 'Power unit: Overload I2t. Inverter thermal model exceeded.' },
    { id: 'A70012', group: 'Fault', val: 6, color: '#e11d48', desc: 'Drive: Safety fault detected in the profisafe communication.' },
    { id: 'Comm Timeout', group: 'Fault', val: 6, color: '#e11d48', desc: 'PROFINET communication cycle exceeded threshold.' },

    // Documents
    { id: 's71200_system_manual', group: 'Document', val: 7, color: '#0d9488', desc: 'Official Siemens S7-1200 System Manual' },
    { id: 'G120C_op_instr_0917', group: 'Document', val: 7, color: '#0d9488', desc: 'SINAMICS G120C Operating Instructions (09/2017)' },
    { id: 'Programming_guideline_v16', group: 'Document', val: 7, color: '#0d9488', desc: 'Programming guidelines and programming styleguide for S7-1200/1500' },
    { id: 's7-1500_manual_collection', group: 'Document', val: 7, color: '#0d9488', desc: 'Comprehensive manual collection for the S7-1500 system' },

    // Agents
    { id: 'RCA Agent', group: 'Agent', val: 9, color: '#0f172a', desc: 'Root Cause Analysis AI Agent' },
    { id: 'Copilot', group: 'Agent', val: 9, color: '#0f172a', desc: 'General Knowledge AI Assistant' }
  ],
  links: [
    // Hardware topologies
    { source: 'G120C Inverter', target: 'Compressor St. 2', label: 'DRIVES' },
    { source: 'S7-1200 PLC', target: 'G120C Inverter', label: 'CONTROLS' },
    { source: 'S7-1500 PLC', target: 'G120C Inverter', label: 'CONTROLS' },
    
    // Software relationships
    { source: 'TIA Portal v16', target: 'S7-1200 PLC', label: 'PROGRAMS' },
    { source: 'TIA Portal v16', target: 'S7-1500 PLC', label: 'PROGRAMS' },
    { source: 'S7-1200 PLC', target: 'PROFINET', label: 'COMMUNICATES_VIA' },
    { source: 'G120C Inverter', target: 'PROFINET', label: 'COMMUNICATES_VIA' },
    { source: 'MigrationTool G2', target: 'TIA Portal v16', label: 'EXTENDS' },

    // Fault relationships
    { source: 'F30005', target: 'G120C Inverter', label: 'OCCURS_ON' },
    { source: 'A70012', target: 'PROFINET', label: 'AFFECTS' },
    { source: 'Comm Timeout', target: 'PROFINET', label: 'AFFECTS' },
    { source: 'F30005', target: 'Compressor St. 2', label: 'CAUSES_SHUTDOWN' },

    // Document relationships
    { source: 'S7-1200 PLC', target: 's71200_system_manual', label: 'DOCUMENTED_IN' },
    { source: 'S7-1500 PLC', target: 's7-1500_manual_collection', label: 'DOCUMENTED_IN' },
    { source: 'G120C Inverter', target: 'G120C_op_instr_0917', label: 'DOCUMENTED_IN' },
    { source: 'TIA Portal v16', target: 'Programming_guideline_v16', label: 'GUIDED_BY' },
    
    { source: 'F30005', target: 'G120C_op_instr_0917', label: 'DIAGNOSED_IN' },
    { source: 'A70012', target: 's71200_system_manual', label: 'DIAGNOSED_IN' },

    // Agent relationships
    { source: 'RCA Agent', target: 'F30005', label: 'DIAGNOSES' },
    { source: 'RCA Agent', target: 'Comm Timeout', label: 'DIAGNOSES' },
    { source: 'Copilot', target: 's71200_system_manual', label: 'READS' },
    { source: 'Copilot', target: 'Programming_guideline_v16', label: 'READS' },
    { source: 'Copilot', target: 'G120C_op_instr_0917', label: 'READS' }
  ]
};
