'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input } from '@pgm/ui';
import { Modal } from '@/components/Modal';
import { ApiRequestError } from '@/lib/api';
import { createRole, updateRole } from '@/lib/roles';
import { listAllPermissions } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import type { Role } from '@/types/roles';
import type { Permission } from '@/types/permissions';

type RoleFormDialogProps = {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FieldErrors = Partial<Record<'name' | 'permissions', string>>;

export function RoleFormDialog({ open, role, onClose, onSuccess }: RoleFormDialogProps) {
  const isEdit = role !== null;
  const { can } = usePermissions();
  const canViewPermissions = can('permissions.view');

  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? '');
    setSelectedPermissions(role?.permissions ?? []);
    setFormError(null);
    setFieldErrors({});
  }, [open, role]);

  useEffect(() => {
    if (!open || !canViewPermissions) return;

    let cancelled = false;
    setPermissionsLoading(true);
    setPermissionsError(null);

    listAllPermissions()
      .then((data) => {
        if (!cancelled) setPermissions(data);
      })
      .catch(() => {
        if (!cancelled) setPermissionsError('Could not load permissions.');
      })
      .finally(() => {
        if (!cancelled) setPermissionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, canViewPermissions]);

  function togglePermission(value: string) {
    setSelectedPermissions((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  }

  function selectAll() {
    setSelectedPermissions(permissions.map((p) => p.name));
  }

  function clearAll() {
    setSelectedPermissions([]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      if (isEdit && role) {
        const payload: { name?: string; permissions?: string[] } = {
          name,
        };
        if (canViewPermissions) {
          payload.permissions = selectedPermissions;
        }
        await updateRole(role.id, payload);
      } else {
        await createRole({
          name,
          permissions: canViewPermissions ? selectedPermissions : undefined,
        });
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(err.message);
        if (err.errors) {
          setFieldErrors({
            name: err.errors.name?.[0],
            permissions: err.errors.permissions?.[0],
          });
        }
      } else {
        setFormError('Could not save role. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit role' : 'Create role'}
      description={
        isEdit
          ? 'Update the role name and the permissions assigned to it.'
          : 'Define a new role and assign the permissions it should grant.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="role-form"
            variant="primary"
            size="sm"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create role'}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Name"
          required
          placeholder="e.g. editor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          disabled={submitting}
        />

        {canViewPermissions ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Permissions{' '}
                <span className="text-xs font-normal text-gray-500">
                  ({selectedPermissions.length} selected)
                </span>
              </label>
              {permissions.length > 0 ? (
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    onClick={selectAll}
                    disabled={submitting}
                  >
                    Select all
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-700 disabled:opacity-50"
                    onClick={clearAll}
                    disabled={submitting}
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </div>

            {permissionsError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {permissionsError}
              </div>
            ) : permissionsLoading ? (
              <p className="text-xs text-gray-500">Loading permissions...</p>
            ) : permissions.length === 0 ? (
              <p className="text-xs text-gray-500">No permissions available.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-2">
                <div className="flex flex-wrap gap-2">
                  {permissions.map((perm) => {
                    const checked = selectedPermissions.includes(perm.name);
                    return (
                      <label
                        key={perm.id}
                        className={
                          checked
                            ? 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 font-mono text-xs font-medium text-indigo-700'
                            : 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 font-mono text-xs font-medium text-gray-700 hover:bg-gray-50'
                        }
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          checked={checked}
                          onChange={() => togglePermission(perm.name)}
                          disabled={submitting}
                        />
                        {perm.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {fieldErrors.permissions ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.permissions}</p>
            ) : null}
          </div>
        ) : null}

        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
