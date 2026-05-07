'use client';

import { Button } from '@pgm/ui';
import { Can } from '@/components/Can';
import type { Role } from '@/types/roles';

type RolesTableProps = {
  roles: Role[];
  loading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
};

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function RolesTable({ roles, loading, onEdit, onDelete }: RolesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Guard</th>
            <th className="px-4 py-3 font-medium">Permissions</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading && roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No roles found.
              </td>
            </tr>
          ) : (
            roles.map((role) => {
              const perms = role.permissions ?? [];
              const visiblePerms = perms.slice(0, 4);
              const remaining = perms.length - visiblePerms.length;
              const isProtected = role.name === 'super-admin';

              return (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {role.guard_name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {perms.length === 0 ? (
                      <span className="text-xs text-gray-500">No permissions</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {visiblePerms.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-medium text-indigo-700"
                          >
                            {p}
                          </span>
                        ))}
                        {remaining > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            +{remaining} more
                          </span>
                        ) : null}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(role.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Can permission="roles.update">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                          Edit
                        </Button>
                      </Can>
                      <Can permission="roles.delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onDelete(role)}
                          disabled={isProtected}
                          title={isProtected ? 'Cannot delete the super-admin role' : undefined}
                        >
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
