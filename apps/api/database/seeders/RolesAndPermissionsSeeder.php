<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.view',
            'permissions.create',
            'permissions.update',
            'permissions.delete',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'api']);
        }

        $allPermissions = Permission::where('guard_name', 'api')->pluck('name')->all();

        $roles = ['super-admin', 'admin', 'manager', 'editor', 'user'];

        foreach ($roles as $roleName) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'api']);

            if ($roleName === 'super-admin') {
                $role->syncPermissions($allPermissions);
                continue;
            }

            // Assign a random subset of permissions (between 2 and all-1).
            $count = random_int(2, max(2, count($allPermissions) - 1));
            $randomPermissions = collect($allPermissions)->shuffle()->take($count)->all();
            $role->syncPermissions($randomPermissions);
        }
    }
}
