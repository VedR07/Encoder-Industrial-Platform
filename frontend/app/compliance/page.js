'use client';

import React from 'react';
import ComplianceMatrix from '../../components/compliance/ComplianceMatrix';
import GapAlertFeed from '../../components/compliance/GapAlertFeed';
import EvidencePackage from '../../components/compliance/EvidencePackage';

export default function CompliancePage() {
  return (
    <div className="p-6 space-y-6 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase">
          Quality & Regulatory Compliance Intelligence
        </h1>
        <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider">
          Compliance scoreboards • Gap Analysis
        </p>
      </div>

      {/* Compliance Matrix scoreboards */}
      <ComplianceMatrix />

      {/* Split lower dashboard area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <EvidencePackage />
        </div>
        <div>
          <GapAlertFeed />
        </div>
      </div>
    </div>
  );
}
