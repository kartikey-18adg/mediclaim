import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Pill } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: 'taken' | 'upcoming' | 'missed';
  type: string;
  prescribedBy: string;
}

const medications: Medication[] = [
  {
    id: 'med-amlod',
    name: 'Amlodipine',
    dosage: '5mg',
    time: '07:00 AM',
    status: 'taken',
    type: 'Antihypertensive',
    prescribedBy: 'Dr. Priya Nair',
  },
  {
    id: 'med-metf',
    name: 'Metformin',
    dosage: '500mg',
    time: '08:30 AM',
    status: 'taken',
    type: 'Antidiabetic',
    prescribedBy: 'Dr. Suresh Iyer',
  },
  {
    id: 'med-ator',
    name: 'Atorvastatin',
    dosage: '10mg',
    time: '01:00 PM',
    status: 'upcoming',
    type: 'Statin',
    prescribedBy: 'Dr. Priya Nair',
  },
  {
    id: 'med-asp',
    name: 'Aspirin',
    dosage: '75mg',
    time: '02:00 PM',
    status: 'missed',
    type: 'Antiplatelet',
    prescribedBy: 'Dr. Priya Nair',
  },
  {
    id: 'med-metf-eve',
    name: 'Metformin',
    dosage: '500mg',
    time: '08:00 PM',
    status: 'upcoming',
    type: 'Antidiabetic',
    prescribedBy: 'Dr. Suresh Iyer',
  },
];

const statusConfig = {
  taken: { icon: <CheckCircle2 size={14} className="text-positive" />, badge: 'badge-positive', label: 'Taken' },
  upcoming: { icon: <Clock size={14} className="text-info" />, badge: 'badge-info', label: 'Upcoming' },
  missed: { icon: <AlertCircle size={14} className="text-negative" />, badge: 'badge-negative', label: 'Missed' },
};

export default function MedicationTimeline() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Medication Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Today, 29 Aug 2026</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-positive" />
            2 taken
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-negative" />
            1 missed
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-3">
          {medications.map((med) => {
            const config = statusConfig[med.status];
            return (
              <div key={med.id} className="relative flex items-start gap-3 pl-10">
                <div className={`absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 border-card ${
                  med.status === 'taken' ? 'bg-positive' :
                  med.status === 'missed' ? 'bg-negative' : 'bg-info'
                }`} />
                <div className={`flex-1 border rounded-xl p-3 transition-colors ${
                  med.status === 'missed' ? 'border-negative/30 bg-negative/5' :
                  med.status === 'upcoming'? 'border-border bg-muted/20' : 'border-border bg-card'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Pill size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {med.name} <span className="font-normal text-muted-foreground">{med.dosage}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{med.type} · {med.prescribedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">{med.time}</span>
                      <span className={`badge ${config.badge} text-xs`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}