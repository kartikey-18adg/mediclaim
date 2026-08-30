import React from 'react';

type BadgeVariant = 'positive' | 'negative' | 'warning' | 'info' | 'muted' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  positive: 'badge-positive',
  negative: 'badge-negative',
  warning: 'badge-warning',
  info: 'badge-info',
  muted: 'badge-muted',
  accent: 'badge bg-accent/10 text-accent',
};

export default function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}