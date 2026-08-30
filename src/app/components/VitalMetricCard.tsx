import React from 'react';

type VitalStatus = 'normal' | 'warning' | 'critical';

interface VitalMetricCardProps {
  label: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  status: VitalStatus;
  icon: React.ReactNode;
  normalRange: string;
  lastUpdated: string;
}

const statusConfig: Record<VitalStatus, { bg: string; dot: string; badge: string; text: string }> = {
  normal: {
    bg: 'gradient-card-positive',
    dot: 'bg-positive',
    badge: 'badge-positive',
    text: 'Normal',
  },
  warning: {
    bg: 'gradient-card-warning',
    dot: 'bg-warning',
    badge: 'badge-warning',
    text: 'Borderline',
  },
  critical: {
    bg: 'gradient-card-negative',
    dot: 'bg-negative',
    badge: 'badge-negative',
    text: 'High Risk',
  },
};

const trendIcons: Record<'up' | 'down' | 'stable', { icon: string; color: string }> = {
  up: { icon: '↑', color: 'text-negative' },
  down: { icon: '↓', color: 'text-positive' },
  stable: { icon: '→', color: 'text-muted-foreground' },
};

export default function VitalMetricCard({
  label, value, unit, trend, trendValue, status, icon, normalRange, lastUpdated,
}: VitalMetricCardProps) {
  const config = statusConfig[status];
  const trendConfig = trendIcons[trend];

  return (
    <div className={`card p-5 ${config.bg} transition-all duration-200 hover:shadow-elevated`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="section-label mb-0.5">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="metric-value">{value}</span>
            <span className="text-sm text-muted-foreground font-medium">{unit}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <span className={`badge ${config.badge} text-xs`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.text}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Normal: <span className="font-medium text-foreground">{normalRange}</span>
        </p>
        <p className={`text-xs font-semibold tabular-nums flex items-center gap-0.5 ${trendConfig.color}`}>
          {trendConfig.icon} {trendValue}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">Updated {lastUpdated}</p>
    </div>
  );
}