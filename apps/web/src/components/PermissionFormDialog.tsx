'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input } from '@pgm/ui';
import { Modal } from '@/components/Modal';
import { ApiRequestError } from '@/lib/api';
import { createPermission, updatePermission } from '@/lib/permissions';
import type { Permission } from '@/types/permissions';

type PermissionFormDialogProps = {
  open: boolean;
  permission: Permission | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function PermissionFormDialog({
  open,
  permission,
  onClose,
  onSuccess,
}: PermissionFormDialogProps) {
  const isEdit = permission !== null;

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setName(permission?.name ?? '');
    setFormError(null);
    setNameError(undefined);
  }, [open, permission]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setNameError(undefined);
    setSubmitting(true);

    try {
      if (isEdit && permission) {
        await updatePermission(permission.id, { name });
      } else {
        await createPermission({ name });
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(err.message);
        if (err.errors?.name?.[0]) setNameError(err.errors.name[0]);
      } else {
        setFormError('Could not save permission. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit permission' : 'Create permission'}
      description={
        isEdit
          ? 'Rename an existing permission. Use dot notation, e.g. resource.action.'
          : 'Define a new permission. Use dot notation, e.g. resource.action.'
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="permission-form"
            variant="primary"
            size="sm"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create permission'}
          </Button>
        </>
      }
    >
      <form
        id="permission-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label="Name"
          required
          placeholder="e.g. invoices.view"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          disabled={submitting}
        />

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
