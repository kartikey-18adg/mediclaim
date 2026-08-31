'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Calculator,
  CalendarClock,
  IndianRupee,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { getInitialAppData, loadAppData, type PolicyItem } from '@/lib/app-data';

const statusBadge: Record<PolicyItem['status'], string> = {
  Active: 'badge-positive',
  'Grace period': 'badge-warning',
};

function parseAmount(value: string) {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

function formatAmount(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function CoverageContent() {
  const [appData, setAppData] = useState(getInitialAppData());

  useEffect(() => {
    void (async () => {
      setAppData(await loadAppData());
    })();
  }, []);

  const { policies, profile } = appData;

  const totalSumInsured = useMemo(
    () => policies.reduce((total, policy) => total + parseAmount(policy.sumInsured), 0),
    [policies],
  );

  const averageCover = useMemo(() => {
    if (!policies.length) return 0;
    const total = policies.reduce((sum, policy) => sum + parseAmount(policy.cover), 0);
    return Math.round(total / policies.length);
  }, [policies]);

  const activeCount = policies.filter((policy) => policy.status === 'Active').length;

  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="section-label mb-2">Health &amp; Insurance</p>
          <h1 className="text-2xl font-bold text-foreground">Coverage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Policies linked to {profile.name} · Member {profile.memberId}
          </p>
        </div>
        <Link href="/coverage-calculator" className="btn-primary">
          <Calculator size={14} />
          Estimate a treatment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
            <p className="text-xs text-muted-foreground">Total sum insured</p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatAmount(totalSumInsured)}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-positive/10 text-positive flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <p className="text-xs text-muted-foreground">Active policies</p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {activeCount}/{policies.length}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <BadgeCheck size={16} />
            </div>
            <p className="text-xs text-muted-foreground">Average cover</p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{averageCover}%</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-foreground">Your policies</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sum insured, cover percentage and renewal windows
            </p>
          </div>
          <span className="badge-muted">{profile.plan}</span>
        </div>

        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.name} className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-base font-semibold text-foreground">{policy.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sum insured {policy.sumInsured}
                  </p>
                </div>
                <span className={statusBadge[policy.status]}>{policy.status}</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Cover</span>
                  <span className={`font-semibold tabular-nums ${policy.accent}`}>
                    {policy.cover}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(parseAmount(policy.cover), 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Network size={14} className="text-info" />
                  {policy.network}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock size={14} className="text-primary" />
                  {policy.renewal}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
