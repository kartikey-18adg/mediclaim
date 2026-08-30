'use client';

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts';

const coverageData = [
  { name: 'Used', value: 62, fill: 'var(--primary)' },
  { name: 'Remaining', value: 38, fill: 'var(--border)' },
];

export default function CoverageRadialChart() {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={120}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          startAngle={90}
          endAngle={-270}
          data={coverageData}
          barSize={12}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'var(--muted)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold tabular-nums text-foreground">62%</span>
        <span className="text-xs text-muted-foreground">utilized</span>
      </div>
    </div>
  );
}