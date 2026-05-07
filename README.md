# pgm-app

A monorepo project combining a **Next.js** frontend and a **Laravel** backend, orchestrated with **Turborepo** + **pnpm workspaces**, and runnable end-to-end via **Docker Compose**.

## Stack

| Layer        | Tech                                           |
| ------------ | ---------------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript  |
| Backend      | Laravel 11, PHP 8.3                            |
| Database     | MySQL 8.4                                      |
| Cache/Queue  | Redis 7                                        |
| Monorepo     | Turborepo + pnpm workspaces                    |
| Container    | Docker / Docker Compose                        |

## Project structure

```
pgm-app/
├── apps/
│   ├── web/                 # Next.js frontend (@my-app/web)
│   └── api/                 # Laravel backend (@my-app/api) — bootstrapped via composer
├── packages/
│   ├── ui/                  # Shared React components (@my-app/ui)
│   ├── config/              # Shared eslint + tsconfig presets (@my-app/config)
│   └── utils/               # Shared TS helpers (@my-app/utils)
├── docker/
│   ├── docker-compose.yml   #  api + mysql + redis
│   └── api.Dockerfile
├── scripts/
│   ├── bootstrap-api.sh     # Scaffolds Laravel into apps/api (bash/macOS/Linux)
│   └── bootstrap-api.ps1    # Scaffolds Laravel into apps/api (Windows PowerShell)
├── .env.example
├── package.json             # root workspace + turbo scripts
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Prerequisites

- Node.js **>= 20**
- pnpm **>= 9** (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- PHP **>= 8.4** with the usual Laravel extensions (mbstring, pdo_mysql, intl, etc.)
- Composer **>= 2**
- Docker (optional, for the containerized workflow)

## Getting started

### 1. Clone and install JS deps

```bash
pnpm install
cp .env.example .env
```

### 2. Bootstrap the Laravel API

The `apps/api` directory only contains a placeholder so Composer can create a fresh Laravel project there.

```bash
# macOS / Linux
bash scripts/bootstrap-api.sh

# Windows PowerShell
pwsh scripts/bootstrap-api.ps1
```

The script will:
1. Run `composer create-project laravel/laravel apps/api`.
2. Drop a small `package.json` into `apps/api/` so Turborepo can run `dev`/`build`.
3. Add a `GET /api/health` route used by the homepage health check.

Then finalize:

```bash
cd apps/api
cp .env.example .env
php artisan key:generate
php artisan migrate           # once your DB is reachable
cd ../..
```

### 3. Run everything (local, no Docker)

```bash
pnpm dev
```

Turbo will start both apps in parallel:
- Web: <http://localhost:3000>
- API: <http://localhost:8000>

### 3-alt. Run everything with Docker

```bash
pnpm docker:build
pnpm docker:up
```

This brings up `api`, `mysql`, and `redis`. Stop with:

```bash
pnpm docker:down
```

## Common scripts (root)

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `pnpm dev`           | Run all apps in dev mode via Turbo                      |
| `pnpm build`         | Build every workspace                                   |
| `pnpm lint`          | Lint every workspace                                    |
| `pnpm format`        | Run Prettier across the repo                            |
| `pnpm clean`         | Remove build artifacts and `node_modules`               |
| `pnpm docker:up`     | `docker compose up -d` for the full stack               |
| `pnpm docker:down`   | Stop the Docker stack                                   |
| `pnpm docker:build`  | Rebuild Docker images                                   |

## Workspace package names

- `@pgm/web` — Next.js app (`apps/web`)
- `@pgm/api` — Laravel app (`apps/api`, after bootstrap)
- `@pgm/ui` — shared React components (`packages/ui`)
- `@pgm/utils` — shared TypeScript helpers (`packages/utils`)
- `@pgm/config` — shared eslint/tsconfig presets (`packages/config`)

Use them from `apps/web` like:

```ts
import { Button, Card } from '@pgm/ui';
import { formatDate, cn } from '@pgm/utils';
```

To add another shared package:

```bash
mkdir -p packages/my-pkg
# create packages/my-pkg/package.json with "name": "@pgm/my-pkg"
pnpm install
```

## Environment variables

The root `.env.example` documents every variable used across the stack. Copy it to `.env` for the Docker compose stack, and copy the relevant subset to `apps/web/.env.local` and `apps/api/.env` for local (non-Docker) runs.

Key vars:

- `NEXT_PUBLIC_API_URL` — used by the web app to call the Laravel API.
- `DB_*`, `REDIS_*` — consumed by Laravel and the Docker stack.
- `SANCTUM_STATEFUL_DOMAINS` / `SESSION_DOMAIN` — wire these up if you use Sanctum SPA auth.

## CORS / API connectivity (Laravel)

After bootstrapping `apps/api`, edit `config/cors.php` so the Next.js origin is allowed:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('APP_URL'), 'http://localhost:3000'],
'supports_credentials' => true,
```

## Troubleshooting

- **`composer create-project` fails because `apps/api` is not empty** — delete `apps/api/.gitkeep` (the bootstrap script does this) or remove the dir entirely and re-run.
- **Web can't reach API in Docker** — inside the `web` container, the API is at `http://api:8000`. The browser-side `NEXT_PUBLIC_API_URL` should still point at `http://localhost:8000` since the browser runs on your host.
- **MySQL "connection refused" on first boot** — wait for the healthcheck; `api` depends on `mysql` being healthy. On a slow machine you may need to `pnpm docker:down && pnpm docker:up` once.

## License

MIT — .
