import React from 'react';
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Claim {
  id: string;
  claimNo: string;
  hospital: string;
  amount: string;
  status: 'approved' | 'under-review' | 'rejected' | 'submitted';
  date: string;
  type: string;
}

const claims: Claim[] = [
  {
    id: 'claim-2026-0841',
    claimNo: 'CLM-2026-0841',
    hospital: 'Apollo Hospitals, Navi Mumbai',
    amount: '₹48,250',
    status: 'approved',
    date: '22 Aug 2026',
    type: 'Hospitalization',
  },
  {
    id: 'claim-2026-0892',
    claimNo: 'CLM-2026-0892',
    hospital: 'Fortis Healthcare, Pune',
    amount: '₹12,800',
    status: 'under-review',
    date: '27 Aug 2026',
    type: 'Day Care',
  },
  {
    id: 'claim-2026-0754',
    claimNo: 'CLM-2026-0754',
    hospital: 'Kokilaben Hospital, Mumbai',
    amount: '₹6,400',
    status: 'rejected',
    date: '10 Aug 2026',
    type: 'OPD',
  },
];

const statusConfig = {
  approved: { icon: <CheckCircle2 size={13} />, badge: 'badge-positive', label: 'Approved' },
  'under-review': { icon: <Clock size={13} />, badge: 'badge-warning', label: 'Under Review' },
  rejected: { icon: <XCircle size={13} />, badge: 'badge-negative', label: 'Rejected' },
  submitted: { icon: <FileText size={13} />, badge: 'badge-info', label: 'Submitted' },
};

export default function ClaimStatusStrip() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent Claims</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 90 days</p>
        </div>
        <Link href="/claims" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          View All <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-2.5">
        {claims.map((claim) => {
          const config = statusConfig[claim.status];
          return (
            <div
              key={claim.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{claim.claimNo}</p>
                  <span className="badge-muted text-xs hidden sm:inline-flex">{claim.type}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{claim.hospital}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold tabular-nums text-foreground">{claim.amount}</p>
                <span className={`badge ${config.badge} text-xs`}>
                  {config.icon}
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}