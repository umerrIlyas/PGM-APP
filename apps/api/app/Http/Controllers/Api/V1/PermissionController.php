<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permissions\StorePermissionRequest;
use App\Http\Requests\Permissions\UpdatePermissionRequest;
use App\Http\Resources\PermissionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);

        $permissions = Permission::query()
            ->orderBy('name')
            ->paginate($perPage);

        return $this->ok(PermissionResource::collection($permissions));
    }

    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = Permission::create([
            'name' => $request->validated('name'),
            'guard_name' => 'api',
        ]);

        return $this->created(new PermissionResource($permission), 'Permission created.');
    }

    public function show(Permission $permission): JsonResponse
    {
        return $this->ok(new PermissionResource($permission));
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['name'])) {
            $permission->name = $data['name'];
            $permission->save();
        }

        return $this->ok(new PermissionResource($permission->fresh()), 'Permission updated.');
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $permission->delete();

        return $this->noContent('Permission deleted.');
    }
}
