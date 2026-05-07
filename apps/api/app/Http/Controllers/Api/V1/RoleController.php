<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);

        $roles = Role::query()
            ->with('permissions')
            ->orderBy('name')
            ->paginate($perPage);

        return $this->ok(RoleResource::collection($roles));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();

        $role = DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => 'api',
            ]);

            if (! empty($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            return $role->load('permissions');
        });

        return $this->created(new RoleResource($role), 'Role created.');
    }

    public function show(Role $role): JsonResponse
    {
        return $this->ok(new RoleResource($role->load('permissions')));
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($role, $data) {
            if (isset($data['name'])) {
                $role->name = $data['name'];
                $role->save();
            }

            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions']);
            }
        });

        return $this->ok(
            new RoleResource($role->fresh('permissions')),
            'Role updated.'
        );
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return $this->noContent('Role deleted.');
    }
}
