# Global Rules & Workflow

## 1. Execution Workflow

1. **Docker First:** The application must run in a Docker container from Day 1. Do not suggest or use direct host execution for the server itself.
2. **Prod-only Docker, no hot-reload:** After changing dependencies or source code that needs to run in the container, rebuild before testing: `docker compose up -d --build`. Never assume changes appear automatically.
3. **Inspect Before Writing:** Do not create duplicate modules or files. Always look at existing structural patterns, DTOs, and import orders before adding new ones.
4. **Validation:** Ensure all requests/responses are validated globally (via `class-validator` + the global `ValidationPipe`) before reaching business logic.
5. **Git hooks are enforced at the repo root**, not inside `backend/`. `core.hooksPath` points to `.husky/` in the monorepo root. Do not add a `prepare` script inside `backend/package.json` that re-runs `husky init` — it breaks the shared hook path.

## 2. Universal Code Quality

- **No Magic Values:** NEVER hardcode numbers or strings (cache TTL, throttler limits, route paths, rule weights). Extract into `constants.ts` files or environment variables.
- **Single Responsibility:** Controllers handle HTTP only. Services orchestrate logic. Rules calculate one metric each. Do not mix these responsibilities in one file.
- **Subagents:** Use asynchronous subagents for background research (e.g., checking current Google Places API limits/pricing) if you lack up-to-date context — do not guess at API behavior that could have changed.

## 3. Commits (applies to the whole monorepo — single source of truth)

Conventional Commits: `<type>(<scope>): <description>`. Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `chore`. One logical change per commit — do not bundle unrelated changes. Never commit `.env` — only `.env.example`.
