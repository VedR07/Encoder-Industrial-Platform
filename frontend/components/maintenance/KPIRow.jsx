import React from 'react';
import MetricCard from '../ui/MetricCard';

export default function KPIRow({ kpis = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <MetricCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          unit={kpi.unit}
          trendValue={kpi.trendValue}
          trendIsPositive={kpi.trendIsPositive}
          iconName={kpi.icon}
          sparkline={kpi.sparkline}
        />
      ))}
    </div>
  );
}
