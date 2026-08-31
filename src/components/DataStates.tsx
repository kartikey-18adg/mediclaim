'use client';

import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export function LoadingState({
  label = 'Loading data…',
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="card p-6" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <RefreshCw size={14} className="animate-spin" />
        {label}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-6 border-negative/40" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-negative mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Could not load data</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card p-10 text-center">
      <Inbox size={22} className="mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
