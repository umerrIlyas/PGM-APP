<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->only(['name', 'email', 'password']));

        $user->assignRole('user');

        $token = JWTAuth::fromUser($user);

        return $this->created(
            $this->tokenPayload($token, $user->loadMissing('roles', 'permissions')),
            'User registered.'
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return $this->error('Invalid credentials.', 401);
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();

        return $this->ok(
            $this->tokenPayload($token, $user->loadMissing('roles', 'permissions')),
            'Login successful.'
        );
    }

    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        return $this->ok(new UserResource($user->loadMissing('roles', 'permissions')));
    }

    public function refresh(): JsonResponse
    {
        $token = Auth::guard('api')->refresh();

        /** @var User $user */
        $user = Auth::guard('api')->setToken($token)->user();

        return $this->ok($this->tokenPayload($token, $user->loadMissing('roles', 'permissions')));
    }

    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();

        return $this->ok(null, 'Logged out.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function tokenPayload(string $token, User $user): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => new UserResource($user),
        ];
    }
}
