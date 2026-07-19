'use client';

import React, { useState } from 'react';
import { mockEvidencePackages } from '../../data/complianceData';
import StatusBadge from '../ui/StatusBadge';
import { Archive, Plus, Download, Loader2 } from 'lucide-react';

export default function EvidencePackage() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [activePackages, setActivePackages] = useState(mockEvidencePackages);

  const triggerCompilation = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      // Append a mock compiled package to simulate database write
      const newPackage = {
        id: `ev-${activePackages.length + 1}`,
        packageId: `EVP-2025-0${activePackages.length + 1}`,
        standard: 'PESO / OISD',
        auditType: 'Surveillance',
        status: 'Approved',
        documentsCount: 14,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: '2025-09-01',
        assignedTo: 'AI Core Generator',
        description: 'Auto-Compiled statutory inspection and proof test dossier.',
        completionPercent: 100
      };
      setActivePackages(prev => [newPackage, ...prev]);
    }, 1800);
  };

  return (
    <div className="ink-panel p-5 grid-bg font-mono flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Archive size={14} className="text-[#ef4444]" />
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
            Evidence Packages Dossier
          </h3>
        </div>

        <button
          onClick={triggerCompilation}
          disabled={isCompiling}
          className="px-3.5 py-1.5 bg-[#ef4444] text-zinc-950 font-bold hover:bg-red-500 hover:shadow-[0_0_8px_var(--vermilion)] disabled:opacity-50 transition-all cursor-pointer rounded-none text-[10px] uppercase flex items-center justify-center gap-1.5 min-w-[200px]"
        >
          {isCompiling ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Compiling evidence...</span>
            </>
          ) : (
            <>
              <Plus size={12} />
              <span>Auto-Generate Evidence Package</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-[10px] min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider">
              <th className="py-2 pr-2">ID</th>
              <th className="py-2 px-2">Standard</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Documents</th>
              <th className="py-2 px-2">Progress</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {activePackages.slice(0, 5).map((pkg) => (
              <tr key={pkg.id} className="hover:bg-[#111827]/40">
                <td className="py-2.5 pr-2 font-bold text-zinc-300">{pkg.packageId}</td>
                <td className="py-2.5 px-2 text-zinc-400">{pkg.standard}</td>
                <td className="py-2.5 px-2 text-zinc-400">{pkg.auditType}</td>
                <td className="py-2.5 px-2 text-zinc-400">{pkg.documentsCount} files</td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-zinc-950 border border-zinc-900 h-1.5">
                      <div className="bg-emerald-500 h-full" style={{ width: `${pkg.completionPercent}%` }} />
                    </div>
                    <span>{pkg.completionPercent}%</span>
                  </div>
                </td>
                <td className="py-2.5 px-2">
                  <StatusBadge status={pkg.status} />
                </td>
                <td className="py-2.5 pl-2 text-right">
                  <button className="text-zinc-500 hover:text-zinc-100 transition-colors p-1 border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 cursor-pointer">
                    <Download size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
