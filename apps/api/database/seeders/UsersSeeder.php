<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $roleNames = Role::where('guard_name', 'api')
            ->pluck('name')
            ->reject(fn ($name) => $name === 'super-admin')
            ->values()
            ->all();

        if (empty($roleNames)) {
            $roleNames = ['user'];
        }

        User::factory()
            ->count(100)
            ->create()
            ->each(function (User $user) use ($roleNames) {
                $user->syncRoles([$roleNames[array_rand($roleNames)]]);
            });
    }
}
