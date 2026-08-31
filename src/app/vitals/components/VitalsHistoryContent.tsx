'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, HeartPulse, Stethoscope } from 'lucide-react';
import { loadAppData, getInitialAppData } from '@/lib/app-data';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';


const vitals = [
  { label: 'Heart rate', value: '76 bpm', status: 'Stable', color: 'text-negative' },
  { label: 'Blood pressure', value: '122/80 mmHg', status: 'Slightly elevated', color: 'text-warning' },
  { label: 'SpO₂', value: '98%', status: 'Optimal', color: 'text-info' },
  { label: 'BMI', value: '26.4', status: 'Watchlist', color: 'text-warning' },
];

export default function VitalsHistoryContent() {
  const [appData, setAppData] = useState(getInitialAppData());

  useEffect(() => {
    void (async () => {
      setAppData(await loadAppData());
    })();
  }, []);

  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="section-label mb-2">Health</p>
          <h1 className="text-2xl font-bold text-foreground">Vitals History</h1>
        </div>
        <button className="btn-secondary">
          <Activity size={14} />
          Sync latest readings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {vitals?.map((vital) => (
          <div key={vital?.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{vital?.label}</p>
              <span className={`badge badge-muted ${vital?.color}`}>{vital?.status}</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-foreground">{vital?.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Trend overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 30 days · heart rate, BP, and oxygen</p>
          </div>
          <span className="badge-positive">Healthy</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={appData?.vitalsHistory} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="heartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--negative)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--negative)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="bpFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="heart" stroke="var(--negative)" strokeWidth={2} fill="url(#heartFill)" />
              <Area type="monotone" dataKey="bp" stroke="var(--primary)" strokeWidth={2} fill="url(#bpFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse size={16} className="text-negative" />
              <h3 className="text-base font-semibold text-foreground">Check-ins</h3>
            </div>
            <span className="badge-muted">8 entries</span>
          </div>

          <div className="space-y-3">
            {appData?.vitalsHistory?.map((entry) => (
              <div key={entry?.date} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry?.date}</p>
                  <p className="text-xs text-muted-foreground">HR {entry?.heart} bpm · BP {entry?.bp}</p>
                </div>
                <span className="text-xs font-semibold text-positive inline-flex items-center gap-1">
                  <ArrowUpRight size={12} />
                  {entry?.spo2}% SpO₂
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={16} className="text-primary" />
            <h3 className="text-base font-semibold text-foreground">Clinician notes</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="rounded-xl bg-muted/60 p-3">
              Blood pressure remains borderline high, but the overall trend is stable over the last 3 weeks.
            </p>
            <p className="rounded-xl bg-muted/60 p-3">
              No alarm conditions detected. Continue hydration and evening walks to maintain recovery patterns.
            </p>
            <p className="rounded-xl bg-muted/60 p-3">
              Sleep quality improved by 0.5 hours vs last week, which supports better recovery and consistent vitals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
