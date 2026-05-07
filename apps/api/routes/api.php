<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'success' => true,
    'data' => ['status' => 'ok', 'time' => now()->toIso8601String()],
    'message' => '',
]));

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:api')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware('auth:api')->group(function () {

        Route::middleware('permission:users.view')
            ->get('users', [UserController::class, 'index']);
        Route::middleware('permission:users.view')
            ->get('users/{user}', [UserController::class, 'show']);
        Route::middleware('permission:users.create')
            ->post('users', [UserController::class, 'store']);
        Route::middleware('permission:users.update')
            ->match(['put', 'patch'], 'users/{user}', [UserController::class, 'update']);
        Route::middleware('permission:users.delete')
            ->delete('users/{user}', [UserController::class, 'destroy']);

        Route::middleware('permission:roles.view')
            ->get('roles', [RoleController::class, 'index']);
        Route::middleware('permission:roles.view')
            ->get('roles/{role}', [RoleController::class, 'show']);
        Route::middleware('permission:roles.create')
            ->post('roles', [RoleController::class, 'store']);
        Route::middleware('permission:roles.update')
            ->match(['put', 'patch'], 'roles/{role}', [RoleController::class, 'update']);
        Route::middleware('permission:roles.delete')
            ->delete('roles/{role}', [RoleController::class, 'destroy']);

        Route::middleware('permission:permissions.view')
            ->get('permissions', [PermissionController::class, 'index']);
        Route::middleware('permission:permissions.view')
            ->get('permissions/{permission}', [PermissionController::class, 'show']);
        Route::middleware('permission:permissions.create')
            ->post('permissions', [PermissionController::class, 'store']);
        Route::middleware('permission:permissions.update')
            ->match(['put', 'patch'], 'permissions/{permission}', [PermissionController::class, 'update']);
        Route::middleware('permission:permissions.delete')
            ->delete('permissions/{permission}', [PermissionController::class, 'destroy']);
    });
});
