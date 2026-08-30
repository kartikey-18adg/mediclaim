'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const ReferenceLine = dynamic(() => import('recharts').then((m) => m.ReferenceLine), { ssr: false });

const activityData = [
  { day: 'Mon', steps: 7420, goal: 8000 },
  { day: 'Tue', steps: 9150, goal: 8000 },
  { day: 'Wed', steps: 5830, goal: 8000 },
  { day: 'Thu', steps: 8640, goal: 8000 },
  { day: 'Fri', steps: 6290, goal: 8000 },
  { day: 'Sat', steps: 11200, goal: 8000 },
  { day: 'Sun', steps: 4180, goal: 8000 },
];

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

export default function WeeklyActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={activityData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={28}>
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
          {activityData.map((entry, index) => (
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