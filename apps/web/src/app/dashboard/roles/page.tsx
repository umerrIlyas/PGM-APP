'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@pgm/ui';
import { Can } from '@/components/Can';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';
import { RoleFormDialog } from '@/components/RoleFormDialog';
import { RolesTable } from '@/components/RolesTable';
import { usePermissions } from '@/hooks/usePermissions';
import { ApiRequestError } from '@/lib/api';
import { deleteRole, listRoles } from '@/lib/roles';
import type { PaginationMeta } from '@/types/api';
import type { Role } from '@/types/roles';

const initialMeta: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
};

export default function RolesPage() {
  const { can } = usePermissions();
  const canView = can('roles.view');

  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listRoles({ page });
      setRoles(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Could not load roles.');
      }
    } finally {
      setLoading(false);
    }
  }, [canView, page]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleFormSuccess() {
    closeForm();
    void fetchRoles();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteRole(deleteTarget.id);
      setDeleteTarget(null);
      await fetchRoles();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Could not delete role.');
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!canView) {
    return (
      <Card title="Access denied">
        <p className="text-sm text-gray-600">
          You don&apos;t have permission to view roles.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Roles</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage roles and the permissions they grant.
          </p>
        </div>
        <Can permission="roles.create">
          <Button variant="primary" onClick={openCreate}>
            New role
          </Button>
        </Can>
      </div>

      <Card className="overflow-hidden p-0">
        {error ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <RolesTable
          roles={roles}
          loading={loading}
          onEdit={openEdit}
          onDelete={(role) => {
            setDeleteError(null);
            setDeleteTarget(role);
          }}
        />

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </Card>

      <RoleFormDialog
        open={formOpen}
        role={editing}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete role"
        description={
          deleteTarget
            ? `This will permanently delete the role "${deleteTarget.name}". Users currently assigned this role will lose its permissions.`
            : undefined
        }
        confirmLabel="Delete role"
        loading={deleting}
        destructive
      />

      {deleteError ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteError}
        </div>
      ) : null}
    </div>
  );
}
