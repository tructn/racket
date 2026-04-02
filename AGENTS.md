# Racket

Self-organised badminton group management app. Go + Gin backend, React + Mantine frontend, PostgreSQL via GORM, Auth0 auth.

## Architecture

### Backend (`/`)
- **Framework:** Gin (`github.com/gin-gonic/gin`), **ORM:** GORM + Postgres, **DI:** `go.uber.org/dig`, **Logger:** `go.uber.org/zap`
- **Module:** `github.com/tructn/racket`, **Go:** 1.22
- **Layer order:** `handler/` → `service/` → `domain/` (no skipping layers)
- `internal/feature/` holds self-contained vertical slices with their own handler, router, and DTO — use this for new standalone features
- All handlers and services are wired in `internal/di/di.go` via a single `c.Provide(...)` call — new components **must** be registered there
- Domain models embed `BaseModel` (wraps `gorm.Model`, adds `CreatedByID`/`UpdatedByID` auto-set from context)
- Schema is fully managed by GORM `AutoMigrate` in `db/db.go` — no hand-written DDL

### Frontend (`web/`)
- **Stack:** React 19 + Vite + TypeScript 5.8, **UI:** Mantine 8, **Data:** TanStack Query v5 + axios, **Routing:** react-router-dom v6, **Auth:** `@auth0/auth0-react` v2
- All page components are lazy-loaded via `React.lazy`
- Three layout shells: `AdminLayout`, `MeLayout`, `AnonymousLayout`
- `@` path alias resolves to `web/src/`
- API base URL set via `VITE_API_URL` env var
- Admin role determined from Auth0 custom claim `https://auth.tn.co.uk/roles` via `useClaims()` hook

## Build & Test

```bash
# Backend
go build ./...
go test -v ./...     # or: make test

# Frontend
cd web
npm install
npm run dev          # dev server on :5173
npm run build        # tsc + vite build

# Full stack (Docker)
docker compose up
```

## Conventions

- **Handlers:** thin — parse path params/body, call domain/service, return JSON. Direct GORM queries in handlers are acceptable only for simple reads.
- **DTOs:** define in `internal/dto/` (one file per domain concept); no business logic in DTOs.
- **Constructors:** `NewXxxHandler(db, logger, svc)` and `NewXxxService(db, logger)` — always follow this signature pattern.
- **Domain methods:** validation and mutations live on domain structs (return `error`); use constructor functions like `NewMatch(...)`.
- **Auth:** middleware extracts JWT claims and sets `idp_user_id` / `idp_user_roles` in Gin context — read via `pkg/currentuser/`.
- **Formatting:** `gofmt` for Go; Prettier (`prettier-plugin-tailwindcss`) for frontend — run before committing.
- **Tests:** table-driven with `testify`; place alongside the file under test (`_test.go`).
