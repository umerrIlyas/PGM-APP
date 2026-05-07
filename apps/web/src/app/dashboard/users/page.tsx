'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@pgm/ui';
import { Can } from '@/components/Can';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';
import { UserFormDialog } from '@/components/UserFormDialog';
import { UsersTable } from '@/components/UsersTable';
import { usePermissions } from '@/hooks/usePermissions';
import { ApiRequestError } from '@/lib/api';
import { deleteUser, listUsers } from '@/lib/users';
import type { PaginationMeta } from '@/types/api';
import type { User } from '@/types/users';

const initialMeta: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
};

export default function UsersPage() {
  const { can } = usePermissions();
  const canView = can('users.view');

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listUsers({ page, search });
      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Could not load users.');
      }
    } finally {
      setLoading(false);
    }
  }, [canView, page, search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPage(1);
      setSearch(searchInput.trim());
    },
    [searchInput],
  );

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingUser(null);
  }

  function handleFormSuccess() {
    closeForm();
    void fetchUsers();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Could not delete user.');
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!canView) {
    return (
      <Card title="Access denied">
        <p className="text-sm text-gray-600">
          You don&apos;t have permission to view users.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-600">Manage users, roles and permissions.</p>
        </div>
        <Can permission="users.create">
          <Button variant="primary" onClick={openCreate}>
            New user
          </Button>
        </Can>
      </div>

      <Card className="overflow-hidden p-0">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
            {search ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </form>

        {error ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <UsersTable
          users={users}
          loading={loading}
          onEdit={openEdit}
          onDelete={(user) => {
            setDeleteError(null);
            setDeleteTarget(user);
          }}
        />

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </Card>

      <UserFormDialog
        open={formOpen}
        user={editingUser}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete user"
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.name} (${deleteTarget.email}). This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete user"
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
