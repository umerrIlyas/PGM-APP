'use client';

import { Button } from '@pgm/ui';
import { Modal } from '@/components/Modal';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {loading ? 'Working...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        {description ?? 'Are you sure you want to continue?'}
      </p>
    </Modal>
  );
}
