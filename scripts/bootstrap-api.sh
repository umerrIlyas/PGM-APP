#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/apps/api"

if [ -f "$API_DIR/artisan" ]; then
  echo "Laravel already installed at $API_DIR — skipping."
  exit 0
fi

echo "==> Creating Laravel project in apps/api"
rm -f "$API_DIR/.gitkeep"
composer create-project laravel/laravel "$API_DIR" --prefer-dist --no-interaction

echo "==> Writing turbo wrapper package.json"
cat > "$API_DIR/package.json" <<'JSON'
{
  "name": "@pgm/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "php artisan serve --host=0.0.0.0 --port=8000",
    "build": "php artisan optimize",
    "lint": "echo \"(use ./vendor/bin/pint to lint PHP)\"",
    "clean": "rm -rf vendor bootstrap/cache/*.php storage/framework/cache/data/* .turbo"
  }
}
JSON

echo "==> Adding /api/health endpoint"
HEALTH_ROUTE='Route::get('"'"'/health'"'"', fn () => response()->json(['"'"'status'"'"' => '"'"'ok'"'"', '"'"'time'"'"' => now()->toIso8601String()]));'
if ! grep -q "/health" "$API_DIR/routes/api.php" 2>/dev/null; then
  echo "" >> "$API_DIR/routes/api.php"
  echo "$HEALTH_ROUTE" >> "$API_DIR/routes/api.php"
fi

echo ""
echo "Laravel API ready at $API_DIR"
echo "Next steps:"
echo "  cd apps/api && cp .env.example .env && php artisan key:generate"
