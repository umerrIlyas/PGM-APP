#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$Root = Resolve-Path "$PSScriptRoot\.."
$ApiDir = Join-Path $Root "apps\api"

if (Test-Path (Join-Path $ApiDir "artisan")) {
  Write-Host "Laravel already installed at $ApiDir - skipping."
  exit 0
}

Write-Host "==> Creating Laravel project in apps/api"
$gitkeep = Join-Path $ApiDir ".gitkeep"
if (Test-Path $gitkeep) { Remove-Item $gitkeep -Force }

composer create-project laravel/laravel $ApiDir --prefer-dist --no-interaction
if ($LASTEXITCODE -ne 0) { throw "composer create-project failed" }

Write-Host "==> Writing turbo wrapper package.json"
$pkg = @'
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
'@
Set-Content -Path (Join-Path $ApiDir "package.json") -Value $pkg -Encoding UTF8

Write-Host "==> Adding /api/health endpoint"
$routesFile = Join-Path $ApiDir "routes\api.php"
if (Test-Path $routesFile) {
  $contents = Get-Content $routesFile -Raw
  if ($contents -notmatch "/health") {
    $line = "`r`nRoute::get('/health', fn () => response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]));`r`n"
    Add-Content -Path $routesFile -Value $line
  }
}

Write-Host ""
Write-Host "Laravel API ready at $ApiDir"
Write-Host "Next steps:"
Write-Host "  cd apps/api; Copy-Item .env.example .env; php artisan key:generate"
