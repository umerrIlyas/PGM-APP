<?php

namespace App\Http\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function ok(mixed $data = null, string $message = '', int $status = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data instanceof JsonResource || $data instanceof ResourceCollection) {
            $resourceResponse = $data->response()->getData(true);
            $payload['data'] = $resourceResponse['data'] ?? $resourceResponse;
            if (isset($resourceResponse['meta'])) {
                $payload['meta'] = $resourceResponse['meta'];
            }
            if (isset($resourceResponse['links'])) {
                $payload['links'] = $resourceResponse['links'];
            }
        } elseif ($data instanceof LengthAwarePaginator) {
            $payload['data'] = $data->items();
            $payload['meta'] = [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage(),
            ];
        } else {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }

    protected function created(mixed $data = null, string $message = 'Created.'): JsonResponse
    {
        return $this->ok($data, $message, 201);
    }

    protected function noContent(string $message = 'Deleted.'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], 200);
    }

    protected function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if (! empty($errors)) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
