# Global Rules & Workflow

## 1. Execution Workflow

1. **Inspect Before Writing:** Do not create duplicate modules or files. Always look at existing structural patterns, DTOs, and import orders before adding new ones.
2. **Validation:** For the backend (`apps/api`), ensure all requests/responses are validated globally (via `class-validator` + the global `ValidationPipe`) before reaching business logic.
3. **Monorepo Structure:** Git hooks are enforced at the repo root, not inside `apps/api/` or `apps/web/`. `core.hooksPath` points to `.husky/` in the monorepo root. Do not add a `prepare` script inside sub-apps that re-runs `husky init` — it breaks the shared hook path.
4. **Mandatory Post-Task Checks:** Before marking any task as complete in `state-api.md` or `state-web.md`, you MUST run `npm run lint:check` and `npm run typecheck` (or equivalent) in the respective app. You MUST add this exact line to every completed task checklist: `- [x] Passed strict \`eslint\` and \`typecheck\` validations — done`.
5. **Strict App Separation:** Never couple backend API logic with web rendering. Always return strict, predictable JSON envelopes (`{ success, data, meta }`) from the API. The web client must consume this envelope cleanly.

## 2. Universal Code Quality

- **Style Consistency:** We ALWAYS adhere to the style of the already written code. If there is an existing entry or file, the next one MUST strictly match its formatting, naming conventions, and structure. When creating something entirely new, always look at the styles of other files in the project for reference. This applies strictly to BOTH project source code AND `.agents/` documentation files (`state-api.md`, `state-web.md`, etc.).
- **Proactive Type Imports:** ALWAYS use `import type { ... }` explicitly for any interfaces, DTOs, or types. Do not rely on the linter's auto-fix to clean up standard imports for you.
- **No Magic Values:** NEVER hardcode numbers or strings (cache TTL, throttler limits, route paths, rule weights). Extract into `constants.ts` files (e.g. `analysis.constants.ts` or `scoring.ts`) or environment variables.
- **Single Responsibility:** Controllers handle HTTP only. Services orchestrate logic. Rules calculate one metric each. Do not mix these responsibilities in one file.
- **Subagents:** Use asynchronous subagents for background research (e.g., checking current Google Places API limits/pricing) if you lack up-to-date context — do not guess at API behavior that could have changed.

## 3. Commits (applies to the whole monorepo — single source of truth)

Conventional Commits: `<type>(<scope>): <description>`. Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `chore`. One logical change per commit — do not bundle unrelated changes. Never commit `.env` or `.env.local` — only `.env.example` or `.env.local.example`.

## 4. Safety & Permissions

- **File Deletion:** Always ask the user for permission in the chat before deleting any files from the repository.
- **Package Management:** Always ask the user for permission in the chat before downloading (installing) or deleting (uninstalling) any packages or dependencies (e.g., via npm, pip, yarn, etc.).

## 5. Execution Intent (CRITICAL)

- **Analyze first, execute later:** If the user's message is just a statement, a question, or a request for advice/analysis — DO NOT execute anything (no file edits, no commands). Provide analysis and options instead.
- **Explicit execution only:** ONLY execute actions when the user explicitly uses words like "do", "implement", "create" or explicitly says "do it this way". If you are unsure, ask first.
