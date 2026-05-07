'use client';

import { useAuth } from '@/hooks/useAuth';

export function DashboardGreeting() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Here&apos;s a quick overview of your workspace.
      </p>
    </div>
  );
}
