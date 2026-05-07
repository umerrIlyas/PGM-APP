'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

type CanProps = {
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  role?: string;
  anyRole?: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function Can({
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  fallback = null,
  children,
}: CanProps) {
  const { can, canAny, canAll, hasRole, hasAnyRole } = usePermissions();

  let allowed = true;
  if (permission && !can(permission)) allowed = false;
  if (anyPermission && !canAny(anyPermission)) allowed = false;
  if (allPermissions && !canAll(allPermissions)) allowed = false;
  if (role && !hasRole(role)) allowed = false;
  if (anyRole && !hasAnyRole(anyRole)) allowed = false;

  return <>{allowed ? children : fallback}</>;
}
