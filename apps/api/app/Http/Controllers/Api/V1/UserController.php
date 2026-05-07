<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $search = (string) $request->query('search', '');

        $query = User::query()->with(['roles', 'permissions']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderByDesc('id')->paginate($perPage);

        return $this->ok(UserResource::collection($users));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            if (! empty($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            if (! empty($data['permissions'])) {
                $user->syncPermissions($data['permissions']);
            }

            return $user->load(['roles', 'permissions']);
        });

        return $this->created(new UserResource($user), 'User created.');
    }

    public function show(User $user): JsonResponse
    {
        return $this->ok(new UserResource($user->load(['roles', 'permissions'])));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($user, $data) {
            $user->fill(array_filter([
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'password' => $data['password'] ?? null,
            ], fn ($v) => ! is_null($v)));
            $user->save();

            if (array_key_exists('roles', $data)) {
                $user->syncRoles($data['roles']);
            }

            if (array_key_exists('permissions', $data)) {
                $user->syncPermissions($data['permissions']);
            }
        });

        return $this->ok(
            new UserResource($user->fresh(['roles', 'permissions'])),
            'User updated.'
        );
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return $this->noContent('User deleted.');
    }
}
