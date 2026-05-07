'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { Sidebar } from '@/components/Sidebar';

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-start bg-gray-50">
        <Sidebar />
        <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
