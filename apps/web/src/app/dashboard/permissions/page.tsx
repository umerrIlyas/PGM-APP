'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@pgm/ui';
import { Can } from '@/components/Can';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';
import { PermissionFormDialog } from '@/components/PermissionFormDialog';
import { PermissionsTable } from '@/components/PermissionsTable';
import { usePermissions } from '@/hooks/usePermissions';
import { ApiRequestError } from '@/lib/api';
import { deletePermission, listPermissions } from '@/lib/permissions';
import type { PaginationMeta } from '@/types/api';
import type { Permission } from '@/types/permissions';

const initialMeta: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
};

export default function PermissionsPage() {
  const { can } = usePermissions();
  const canView = can('permissions.view');

  const [permissions, setPermissionsList] = useState<Permission[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Permission | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listPermissions({ page });
      setPermissionsList(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Could not load permissions.');
      }
    } finally {
      setLoading(false);
    }
  }, [canView, page]);

  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(permission: Permission) {
    setEditing(permission);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleFormSuccess() {
    closeForm();
    void fetchPermissions();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePermission(deleteTarget.id);
      setDeleteTarget(null);
      await fetchPermissions();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Could not delete permission.');
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!canView) {
    return (
      <Card title="Access denied">
        <p className="text-sm text-gray-600">
          You don&apos;t have permission to view permissions.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Permissions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Define the permissions that can be assigned to roles and users.
          </p>
        </div>
        <Can permission="permissions.create">
          <Button variant="primary" onClick={openCreate}>
            New permission
          </Button>
        </Can>
      </div>

      <Card className="overflow-hidden p-0">
        {error ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <PermissionsTable
          permissions={permissions}
          loading={loading}
          onEdit={openEdit}
          onDelete={(perm) => {
            setDeleteError(null);
            setDeleteTarget(perm);
          }}
        />

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </Card>

      <PermissionFormDialog
        open={formOpen}
        permission={editing}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete permission"
        description={
          deleteTarget
            ? `This will permanently delete the permission "${deleteTarget.name}". Roles and users currently using it will lose this permission.`
            : undefined
        }
        confirmLabel="Delete permission"
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
