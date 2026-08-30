'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ActivityPoint } from '@/lib/app-data';

interface WeeklyActivityChartProps {
  data: ActivityPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltipContent({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const steps = payload[0]?.value ?? 0;
  const goalMet = steps >= 8000;
  return (
    <div className="bg-card border border-border rounded-xl shadow-elevated p-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className={`font-bold tabular-nums ${goalMet ? 'text-positive' : 'text-warning'}`}>
        {steps.toLocaleString('en-IN')} steps
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Goal: 8,000 — {goalMet ? '✓ Met' : `${(8000 - steps).toLocaleString('en-IN')} short`}
      </p>
    </div>
  );
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltipContent />} />
        <ReferenceLine
          y={8000}
          stroke="var(--warning)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: 'Goal', position: 'right', fontSize: 10, fill: 'var(--warning)' }}
        />
        <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-steps-${index}`}
              fill={entry.steps >= entry.goal ? 'var(--positive)' : 'var(--primary)'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}