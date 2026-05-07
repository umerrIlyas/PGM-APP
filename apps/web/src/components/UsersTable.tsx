'use client';

import { Button } from '@pgm/ui';
import { Can } from '@/components/Can';
import type { User } from '@/types/users';

type UsersTableProps = {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UsersTable({ users, loading, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Roles</th>
            <th className="px-4 py-3 font-medium">Verified</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading && users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-700">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(user.roles ?? []).length === 0 ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      user.roles!.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {user.email_verified_at ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Can permission="users.update">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                        Edit
                      </Button>
                    </Can>
                    <Can permission="users.delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDelete(user)}
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
