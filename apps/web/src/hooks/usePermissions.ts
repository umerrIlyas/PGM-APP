'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
  isSuperAdmin,
} from '@/lib/authz';

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      user,
      can: (permission: string) => hasPermission(user, permission),
      canAny: (permissions: string[]) => hasAnyPermission(user, permissions),
      canAll: (permissions: string[]) => hasAllPermissions(user, permissions),
      hasRole: (role: string) => hasRole(user, role),
      hasAnyRole: (roles: string[]) => hasAnyRole(user, roles),
      isSuperAdmin: isSuperAdmin(user),
    }),
    [user],
  );
}
