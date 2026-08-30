'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AreaChart = dynamic(
  () => import('recharts').then((m) => m.AreaChart),
  { ssr: false }
);
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

const vitalsData = [
  { date: '01 Aug', heartRate: 74, systolic: 122, diastolic: 79, spo2: 98 },
  { date: '03 Aug', heartRate: 78, systolic: 126, diastolic: 82, spo2: 97 },
  { date: '05 Aug', heartRate: 72, systolic: 119, diastolic: 77, spo2: 98 },
  { date: '07 Aug', heartRate: 81, systolic: 132, diastolic: 86, spo2: 96 },
  { date: '09 Aug', heartRate: 76, systolic: 128, diastolic: 83, spo2: 97 },
  { date: '11 Aug', heartRate: 70, systolic: 118, diastolic: 76, spo2: 99 },
  { date: '13 Aug', heartRate: 85, systolic: 138, diastolic: 89, spo2: 95 },
  { date: '15 Aug', heartRate: 79, systolic: 130, diastolic: 84, spo2: 97 },
  { date: '17 Aug', heartRate: 73, systolic: 121, diastolic: 78, spo2: 98 },
  { date: '19 Aug', heartRate: 77, systolic: 125, diastolic: 81, spo2: 98 },
  { date: '21 Aug', heartRate: 82, systolic: 134, diastolic: 87, spo2: 96 },
  { date: '23 Aug', heartRate: 75, systolic: 123, diastolic: 80, spo2: 97 },
  { date: '25 Aug', heartRate: 71, systolic: 117, diastolic: 75, spo2: 99 },
  { date: '27 Aug', heartRate: 80, systolic: 129, diastolic: 83, spo2: 97 },
  { date: '29 Aug', heartRate: 76, systolic: 124, diastolic: 80, spo2: 98 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltipContent({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-elevated p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function VitalsTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={vitalsData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradHR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--negative)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--negative)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSystolic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSpo2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--info)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltipContent />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="heartRate"
          name="Heart Rate (bpm)"
          stroke="var(--negative)"
          strokeWidth={2}
          fill="url(#gradHR)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="systolic"
          name="Systolic BP (mmHg)"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#gradSystolic)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="spo2"
          name="SpO₂ (%)"
          stroke="var(--info)"
          strokeWidth={2}
          fill="url(#gradSpo2)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}