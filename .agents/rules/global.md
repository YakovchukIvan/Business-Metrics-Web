# Global Rules & Workflow

## 1. Execution Workflow

1. **Inspect Before Writing:** Do not create duplicate modules or files. Always look at existing structural patterns, DTOs, and import orders before adding new ones.
2. **Validation:** Ensure all requests/responses are validated globally (via `class-validator` + the global `ValidationPipe`) before reaching business logic.
3. **Git hooks are enforced at the repo root**, not inside `api/`. `core.hooksPath` points to `.husky/` in the monorepo root. Do not add a `prepare` script inside `api/package.json` that re-runs `husky init` — it breaks the shared hook path.
4. **Mandatory Post-Task Checks:** Before marking any task as complete in `state.md`, you MUST run `npm run lint:check` and `npm run typecheck` (or equivalent). You MUST add this exact line to every completed task checklist in `state.md`: `- [x] Passed strict \`eslint\` and \`typecheck\` validations — done`.

## 2. Universal Code Quality

- **Style Consistency:** We ALWAYS adhere to the style of the already written code. If there is an existing entry or file, the next one MUST strictly match its formatting, naming conventions, and structure. When creating something entirely new, always look at the styles of other files in the project for reference. This applies strictly to BOTH project source code AND `.agents/` documentation files (`state.md`, `history.md`, etc.).
- **Proactive Type Imports:** ALWAYS use `import type { ... }` explicitly for any interfaces, DTOs, or types. Do not rely on the linter's auto-fix to clean up standard imports for you.
- **No Magic Values:** NEVER hardcode numbers or strings (cache TTL, throttler limits, route paths, rule weights). Extract into `constants.ts` files or environment variables.
- **Single Responsibility:** Controllers handle HTTP only. Services orchestrate logic. Rules calculate one metric each. Do not mix these responsibilities in one file.
- **Subagents:** Use asynchronous subagents for background research (e.g., checking current Google Places API limits/pricing) if you lack up-to-date context — do not guess at API behavior that could have changed.

## 3. Commits (applies to the whole monorepo — single source of truth)

Conventional Commits: `<type>(<scope>): <description>`. Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `chore`. One logical change per commit — do not bundle unrelated changes. Never commit `.env` — only `.env.example`.

## 4. Safety & Permissions

- **File Deletion:** Always ask the user for permission in the chat before deleting any files from the repository.
- **Package Management:** Always ask the user for permission in the chat before downloading (installing) or deleting (uninstalling) any packages or dependencies (e.g., via npm, pip, yarn, etc.).

## 5. Execution Intent (CRITICAL)

- **Analyze first, execute later:** If the user's message is just a statement, a question, or a request for advice/analysis — DO NOT execute anything (no file edits, no commands). Provide analysis and options instead.
- **Explicit execution only:** ONLY execute actions when the user explicitly uses words like "do", "implement", "create" or explicitly says "do it this way". If you are unsure, ask first.

## 6. Changelog Workflow

- Whenever you complete a request that involved modifying files or running commands, you MUST write a VERY SHORT summary (just a one-line note) of what was done to `.agents/changelog/current_task.txt`. Do this by overwriting the file. The system's `on_stop` hook will automatically append this summary with a timestamp to `.agents/changelog/history.md`.
