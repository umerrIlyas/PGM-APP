'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input } from '@pgm/ui';
import { Modal } from '@/components/Modal';
import { ApiRequestError } from '@/lib/api';
import { createUser, updateUser } from '@/lib/users';
import { listAllRoles } from '@/lib/roles';
import { listAllPermissions } from '@/lib/permissions';
import type { User } from '@/types/users';
import type { Role } from '@/types/roles';
import type { Permission } from '@/types/permissions';
import { usePermissions } from '@/hooks/usePermissions';

type UserFormDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FieldErrors = Partial<
  Record<'name' | 'email' | 'password' | 'password_confirmation' | 'roles' | 'permissions', string>
>;

const emptyForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: [] as string[],
  permissions: [] as string[],
};

export function UserFormDialog({ open, user, onClose, onSuccess }: UserFormDialogProps) {
  const isEdit = user !== null;
  const { can } = usePermissions();

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const canViewRoles = can('roles.view');
  const canViewPermissions = can('permissions.view');

  useEffect(() => {
    if (!open) return;

    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles ?? [],
        permissions: [],
      });
    } else {
      setForm(emptyForm);
    }
    setFormError(null);
    setFieldErrors({});
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    if (!canViewRoles && !canViewPermissions) return;

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError(null);

    Promise.all([
      canViewRoles ? listAllRoles().catch(() => [] as Role[]) : Promise.resolve([] as Role[]),
      canViewPermissions
        ? listAllPermissions().catch(() => [] as Permission[])
        : Promise.resolve([] as Permission[]),
    ])
      .then(([rolesData, permsData]) => {
        if (cancelled) return;
        setRoles(rolesData);
        setPermissions(permsData);
      })
      .catch(() => {
        if (cancelled) return;
        setOptionsError('Could not load roles or permissions.');
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, canViewRoles, canViewPermissions]);

  function toggleArrayValue(field: 'roles' | 'permissions', value: string) {
    setForm((prev) => {
      const list = prev[field];
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      if (isEdit && user) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
        };
        if (form.password) {
          payload.password = form.password;
          payload.password_confirmation = form.password_confirmation;
        }
        if (canViewRoles) payload.roles = form.roles;
        if (canViewPermissions) payload.permissions = form.permissions;

        await updateUser(user.id, payload);
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          roles: canViewRoles ? form.roles : undefined,
          permissions: canViewPermissions ? form.permissions : undefined,
        });
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(err.message);
        if (err.errors) {
          setFieldErrors({
            name: err.errors.name?.[0],
            email: err.errors.email?.[0],
            password: err.errors.password?.[0],
            password_confirmation: err.errors.password_confirmation?.[0],
            roles: err.errors.roles?.[0],
            permissions: err.errors.permissions?.[0],
          });
        }
      } else {
        setFormError('Could not save user. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit user' : 'Create user'}
      description={isEdit ? 'Update user information and access.' : 'Add a new user to the system.'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            variant="primary"
            size="sm"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={fieldErrors.name}
            disabled={submitting}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            error={fieldErrors.email}
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={isEdit ? 'New password (optional)' : 'Password'}
            type="password"
            autoComplete="new-password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            error={fieldErrors.password}
            disabled={submitting}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required={!isEdit || form.password.length > 0}
            value={form.password_confirmation}
            onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
            error={fieldErrors.password_confirmation}
            disabled={submitting}
          />
        </div>

        {optionsError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {optionsError}
          </div>
        ) : null}

        {canViewRoles ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Roles</label>
            {optionsLoading ? (
              <p className="text-xs text-gray-500">Loading roles...</p>
            ) : roles.length === 0 ? (
              <p className="text-xs text-gray-500">No roles available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => {
                  const checked = form.roles.includes(role.name);
                  return (
                    <label
                      key={role.id}
                      className={
                        checked
                          ? 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700'
                          : 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50'
                      }
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5"
                        checked={checked}
                        onChange={() => toggleArrayValue('roles', role.name)}
                        disabled={submitting}
                      />
                      {role.name}
                    </label>
                  );
                })}
              </div>
            )}
            {fieldErrors.roles ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.roles}</p>
            ) : null}
          </div>
        ) : null}

        {canViewPermissions ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Direct permissions{' '}
              <span className="text-xs font-normal text-gray-500">(in addition to role permissions)</span>
            </label>
            {optionsLoading ? (
              <p className="text-xs text-gray-500">Loading permissions...</p>
            ) : permissions.length === 0 ? (
              <p className="text-xs text-gray-500">No permissions available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {permissions.map((perm) => {
                  const checked = form.permissions.includes(perm.name);
                  return (
                    <label
                      key={perm.id}
                      className={
                        checked
                          ? 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'
                          : 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50'
                      }
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5"
                        checked={checked}
                        onChange={() => toggleArrayValue('permissions', perm.name)}
                        disabled={submitting}
                      />
                      {perm.name}
                    </label>
                  );
                })}
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
