import type { User } from '@/types/users';

export const SUPER_ADMIN_ROLE = 'super-admin';

export function hasRole(user: User | null, role: string): boolean {
  if (!user?.roles) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(user: User | null, roles: string[]): boolean {
  if (!user?.roles || roles.length === 0) return false;
  return roles.some((role) => user.roles!.includes(role));
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, SUPER_ADMIN_ROLE);
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return user.permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || permissions.length === 0) return false;
  if (isSuperAdmin(user)) return true;
  return permissions.some((p) => user.permissions?.includes(p));
}

export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || permissions.length === 0) return false;
  if (isSuperAdmin(user)) return true;
  return permissions.every((p) => user.permissions?.includes(p));
}
