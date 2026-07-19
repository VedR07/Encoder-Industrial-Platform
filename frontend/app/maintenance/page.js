'use client';

import React from 'react';
import KPIRow from '../../components/maintenance/KPIRow';
import PredictiveCard from '../../components/maintenance/PredictiveCard';
import RCAGenerator from '../../components/maintenance/RCAGenerator';
import MaintenanceCalendar from '../../components/maintenance/MaintenanceCalendar';

export default function MaintenancePage() {
  return (
    <div className="p-6 space-y-6 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase">
          Maintenance Intelligence & RCA Agent
        </h1>
        <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider">
          Predictive Fault Diagnostics • Root Cause Analysis
        </p>
      </div>

      {/* KPIs */}
      <KPIRow />

      {/* Middle split: RCA Event chain vs calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <RCAGenerator />
        </div>
        <div className="h-[400px]">
          <MaintenanceCalendar />
        </div>
      </div>

      {/* AI fault predictions segment */}
      <div>
        <div className="mb-4 border-b border-zinc-900 pb-2">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
            AI Telemetry Fault Predictions
          </h3>
          <p className="text-[9px] text-zinc-500 uppercase mt-0.5">
            Active anomalies detected across plant telemetry registry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[].slice(0, 3).map((rec) => (
            <PredictiveCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}
