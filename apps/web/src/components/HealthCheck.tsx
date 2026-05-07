'use client';

import { useEffect, useState } from 'react';
import { cn } from '@pgm/utils';

type Status = 'idle' | 'ok' | 'error';

export function HealthCheck() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('Checking...');

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'}/health`;
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { status?: string };
        setStatus('ok');
        setMessage(data.status ?? 'ok');
      })
      .catch((e: Error) => {
        setStatus('error');
        setMessage(e.message);
      });
  }, []);

  const dot =
    status === 'ok'
      ? 'bg-emerald-500'
      : status === 'error'
        ? 'bg-red-500'
        : 'bg-gray-400 animate-pulse';

  const text =
    status === 'ok' ? 'text-emerald-700' : status === 'error' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className={cn('flex items-center gap-2', text)}>
      <span className={cn('inline-block h-2 w-2 rounded-full', dot)} />
      <span>API: {message}</span>
    </div>
  );
}
