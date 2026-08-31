'use client';

import React, { useState } from 'react';
import { BellRing, CalendarClock, CheckCircle2, Pill, PlusCircle, ShieldCheck, X } from 'lucide-react';
import { useAppData, type PrescriptionItem } from '@/lib/app-data';

const accentMap = { positive: 'text-positive', info: 'text-info', warning: 'text-warning' };

export default function PrescriptionsContent() {
  const { data, setData, isLoading, isSaving, error } = useAppData();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', refill: '' });
  const [validation, setValidation] = useState('');
  const active = data.prescriptions.filter((item) => item.status !== 'Completed').length;

  const addPrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.dosage.trim()) { setValidation('Medicine name and dosage are required.'); return; }
    const item: PrescriptionItem = { id: crypto.randomUUID(), name: form.name.trim(), dosage: form.dosage.trim(), refill: form.refill.trim() || 'Refill date not set', status: 'On track', accent: 'positive' };
    await setData((current) => ({ ...current, prescriptions: [...current.prescriptions, item] }));
    setForm({ name: '', dosage: '', refill: '' }); setValidation(''); setIsAdding(false);
  };

  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div><p className="section-label mb-2">Medication</p><h1 className="text-2xl font-bold text-foreground">Prescriptions</h1></div>
        <button className="btn-primary" onClick={() => setIsAdding((value) => !value)} aria-expanded={isAdding}><PlusCircle size={14} /> Add prescription</button>
      </div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>}
      {isAdding && <form onSubmit={addPrescription} className="card p-5 mb-6 grid gap-4 md:grid-cols-3" noValidate>
        <label className="text-sm text-muted-foreground">Medicine name<input className="input mt-1 w-full" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} aria-invalid={Boolean(validation)} /></label>
        <label className="text-sm text-muted-foreground">Dosage<input className="input mt-1 w-full" value={form.dosage} onChange={(event) => setForm({ ...form, dosage: event.target.value })} /></label>
        <label className="text-sm text-muted-foreground">Refill reminder<input className="input mt-1 w-full" placeholder="e.g. 14 days" value={form.refill} onChange={(event) => setForm({ ...form, refill: event.target.value })} /></label>
        <div className="md:col-span-3 flex items-center gap-3"><button className="btn-primary" disabled={isSaving} type="submit">{isSaving ? 'Saving…' : 'Save prescription'}</button><button type="button" className="btn-ghost" onClick={() => setIsAdding(false)}><X size={14} /> Cancel</button>{validation && <span className="text-sm text-warning" role="alert">{validation}</span>}</div>
      </form>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div className="card p-4"><div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Pill size={16} /></div><p className="text-xs text-muted-foreground">Active meds</p></div><p className="text-2xl font-bold text-foreground tabular-nums">{active}</p></div><div className="card p-4"><div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-positive/10 text-positive flex items-center justify-center"><CheckCircle2 size={16} /></div><p className="text-xs text-muted-foreground">Tracked medications</p></div><p className="text-2xl font-bold text-foreground tabular-nums">{data.prescriptions.length}</p></div><div className="card p-4"><div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><BellRing size={16} /></div><p className="text-xs text-muted-foreground">Reminders</p></div><p className="text-2xl font-bold text-foreground tabular-nums">{data.prescriptions.filter((item) => item.refill).length}</p></div></div>
      <div className="card p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-bold text-foreground">Medication schedule</h2><p className="text-xs text-muted-foreground mt-0.5">Current prescriptions and refill reminders</p></div><span className="badge-muted">{isLoading ? 'Loading…' : 'Saved automatically'}</span></div>
        {data.prescriptions.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">No prescriptions yet. Add your first medication to start tracking it.</div> : <div className="space-y-3">{data.prescriptions.map((item) => <div key={item.id} className="rounded-2xl border border-border bg-muted/20 p-4"><div className="flex items-start justify-between gap-3 flex-wrap"><div><p className="text-base font-semibold text-foreground">{item.name}</p><p className="text-sm text-muted-foreground mt-1">{item.dosage}</p></div><span className={`badge ${accentMap[item.accent]} bg-transparent border border-current`}>{item.status}</span></div><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground"><div className="flex items-center gap-2"><CalendarClock size={14} className="text-primary" />{item.refill}</div><div className="flex items-center gap-2"><ShieldCheck size={14} className="text-positive" />User-entered record</div></div></div>)}</div>}
      </div>
    </div>
  );
}
