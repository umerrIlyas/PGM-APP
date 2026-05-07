'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Accent = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'gray';

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: Accent;
  description?: string;
  href?: string;
  loading?: boolean;
  error?: string | null;
};

const accentClass: Record<Accent, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  gray: 'bg-gray-100 text-gray-600',
};

function formatValue(value: number | string): string {
  if (typeof value === 'number') return value.toLocaleString();
  return value;
}

export function MetricCard({
  label,
  value,
  icon,
  accent = 'indigo',
  description,
  href,
  loading = false,
  error = null,
}: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClass[accent]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <p className="text-3xl font-bold tracking-tight text-gray-900">{formatValue(value)}</p>
        )}
        {description && !loading && !error ? (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        ) : null}
      </div>
    </>
  );

  const baseClass =
    'block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors';

  if (href && !loading && !error) {
    return (
      <Link
        href={href}
        className={`${baseClass} hover:border-gray-300 hover:bg-gray-50`}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
