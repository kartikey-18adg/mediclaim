
'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, CalendarClock, CheckCircle2, Pill, PlusCircle, ShieldCheck } from 'lucide-react';
import { loadAppData, getInitialAppData } from '@/lib/app-data';

const accentMap = {
  positive: 'text-positive',
  info: 'text-info',
  warning: 'text-warning',
};

export default function PrescriptionsContent() {
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
          <p className="section-label mb-2">Medication</p>
          <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
        </div>
        <button className="btn-primary">
          <PlusCircle size={14} />
          Add prescription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Pill size={16} /></div>
            <p className="text-xs text-muted-foreground">Active meds</p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">4</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-positive/10 text-positive flex items-center justify-center"><CheckCircle2 size={16} /></div>
            <p className="text-xs text-muted-foreground">Adherence</p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">96%</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><BellRing size={16} /></div>
            <p className="text-xs text-muted-foreground">Reminders</p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">2</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Medication schedule</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Current prescriptions and refill reminders</p>
          </div>
          <span className="badge-muted">Updated today</span>
        </div>

        <div className="space-y-3">
          {appData?.prescriptions?.map((item) => (
            <div key={item?.name} className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-base font-semibold text-foreground">{item?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item?.dosage}</p>
                </div>
                <span className={`badge ${accentMap?.[item?.accent]} bg-transparent border border-current`}>{item?.status}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock size={14} className="text-primary" />
                  {item?.refill}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck size={14} className="text-positive" />
                  Verified by doctor
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
