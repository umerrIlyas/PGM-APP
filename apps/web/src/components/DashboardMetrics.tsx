'use client';

import { useEffect, useState } from 'react';
import { Can } from '@/components/Can';
import { MetricCard } from '@/components/MetricCard';
import { usePermissions } from '@/hooks/usePermissions';
import { ApiRequestError } from '@/lib/api';
import { listPermissions } from '@/lib/permissions';
import { listRoles } from '@/lib/roles';
import { listUsers } from '@/lib/users';

type MetricState = {
  value: number | null;
  loading: boolean;
  error: string | null;
};

const initialMetric: MetricState = { value: null, loading: true, error: null };

function toError(err: unknown): string {
  if (err instanceof ApiRequestError) return err.message;
  return 'Failed to load.';
}

const usersIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const rolesIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M20 7h-7" />
    <path d="M14 17H5" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </svg>
);

const permissionsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export function DashboardMetrics() {
  const { can } = usePermissions();
  const canViewUsers = can('users.view');
  const canViewRoles = can('roles.view');
  const canViewPermissions = can('permissions.view');

  const [users, setUsers] = useState<MetricState>(initialMetric);
  const [roles, setRoles] = useState<MetricState>(initialMetric);
  const [perms, setPerms] = useState<MetricState>(initialMetric);

  useEffect(() => {
    let cancelled = false;

    if (canViewUsers) {
      setUsers({ value: null, loading: true, error: null });
      listUsers({ per_page: 1 })
        .then((res) => {
          if (cancelled) return;
          setUsers({ value: res.meta.total, loading: false, error: null });
        })
        .catch((err) => {
          if (cancelled) return;
          setUsers({ value: null, loading: false, error: toError(err) });
        });
    }

    if (canViewRoles) {
      setRoles({ value: null, loading: true, error: null });
      listRoles({ per_page: 1 })
        .then((res) => {
          if (cancelled) return;
          setRoles({ value: res.meta.total, loading: false, error: null });
        })
        .catch((err) => {
          if (cancelled) return;
          setRoles({ value: null, loading: false, error: toError(err) });
        });
    }

    if (canViewPermissions) {
      setPerms({ value: null, loading: true, error: null });
      listPermissions({ per_page: 1 })
        .then((res) => {
          if (cancelled) return;
          setPerms({ value: res.meta.total, loading: false, error: null });
        })
        .catch((err) => {
          if (cancelled) return;
          setPerms({ value: null, loading: false, error: toError(err) });
        });
    }

    return () => {
      cancelled = true;
    };
  }, [canViewUsers, canViewRoles, canViewPermissions]);

  if (!canViewUsers && !canViewRoles && !canViewPermissions) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Can permission="users.view">
        <MetricCard
          label="Total users"
          value={users.value ?? 0}
          icon={usersIcon}
          accent="indigo"
          description="Registered accounts in the system"
          href="/dashboard/users"
          loading={users.loading}
          error={users.error}
        />
      </Can>

      <Can permission="roles.view">
        <MetricCard
          label="Roles"
          value={roles.value ?? 0}
          icon={rolesIcon}
          accent="emerald"
          description="Defined roles available to assign"
          loading={roles.loading}
          error={roles.error}
        />
      </Can>

      <Can permission="permissions.view">
        <MetricCard
          label="Permissions"
          value={perms.value ?? 0}
          icon={permissionsIcon}
          accent="amber"
          description="Granular access controls"
          href="/dashboard/permissions"
          loading={perms.loading}
          error={perms.error}
        />
      </Can>
    </div>
  );
}
