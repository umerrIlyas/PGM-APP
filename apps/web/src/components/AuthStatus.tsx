'use client';

import Link from 'next/link';
import { Button } from '@pgm/ui';
import { useAuth } from '@/hooks/useAuth';

export function AuthStatus() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return <span className="text-sm text-gray-500">Checking session...</span>;
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        Sign in →
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">
        Signed in as <span className="font-medium">{user.name}</span>
      </span>
      <Button variant="ghost" size="sm" onClick={() => void logout()}>
        Logout
      </Button>
    </div>
  );
}
