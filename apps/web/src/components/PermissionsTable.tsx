'use client';

import { Button } from '@pgm/ui';
import { Can } from '@/components/Can';
import type { Permission } from '@/types/permissions';

type PermissionsTableProps = {
  permissions: Permission[];
  loading?: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
};

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function PermissionsTable({
  permissions,
  loading,
  onEdit,
  onDelete,
}: PermissionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Guard</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading && permissions.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : permissions.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                No permissions found.
              </td>
            </tr>
          ) : (
            permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">
                  {perm.name}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {perm.guard_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(perm.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Can permission="permissions.update">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(perm)}>
                        Edit
                      </Button>
                    </Can>
                    <Can permission="permissions.delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDelete(perm)}
                      >
                        Delete
                      </Button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
