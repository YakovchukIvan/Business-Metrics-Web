# Commit Naming Rules

## Format

`<type>(<scope>): <description>`

## Types

Use only what applies. Most commits in this project will be `feat`, `fix`, `chore`, `build`, `docs`, `refactor`, or `test`.

| Type       | When                                           |
| ---------- | ---------------------------------------------- |
| `feat`     | new functionality                              |
| `fix`      | bug fix                                        |
| `docs`     | documentation only                             |
| `refactor` | code change with no behavior change            |
| `test`     | adding/updating tests                          |
| `build`    | build tooling, Docker, dependencies            |
| `chore`    | maintenance, config, no production code change |
| `style`    | formatting only, no logic change               |
| `perf`     | performance improvement                        |
| `ci`       | CI/CD pipeline changes                         |
| `revert`   | reverts a previous commit                      |

## Scopes — use exactly these, matching our module/folder names

See `.agents/rules/api.md` for what each module does.

- `init` — project bootstrap
- `docker` — Dockerfile, docker-compose, .dockerignore
- `eslint` — eslint.config.mjs, lint rules
- `husky` — git hooks, lint-staged
- `tsconfig` — TypeScript compiler config
- `health` — health check endpoint
- `config` — ConfigModule, Zod env schema
- `cache` — CacheModule
- `google-places` — GooglePlacesModule (adapter, mapper, place-id resolver)
- `analysis` — AnalysisModule (rules engine, scoring, service)
- `api` — controllers, DTOs, routing constants that span modules
- `swagger` — OpenAPI/Swagger setup
- `tests` — cross-module test setup (jest config); for tests of a specific module, use that module's scope instead (e.g. `test(analysis)`, not `test(tests)`)
- `docs` — README, architecture docs
- `deps` — dependency version bumps
- `agents` — `.agents/` itself: hooks, rules, skills, workflows, state.md

**Rule:** prefer the specific module scope (`cache`, `google-places`, `analysis`) over a generic one (`api`, `chore`) whenever the change lives inside one module.

## Description

- Imperative mood, lowercase, English: `add`, `fix`, `remove`, `update`, `implement` — not `added`/`adding`.
- No period at the end.

## Real examples from this project

```bash
chore(init): bootstrap NestJS project
build(docker): add multi-stage Dockerfile and compose setup
chore(eslint): enforce module boundaries and type-import rules
chore(husky): add pre-commit and pre-push hooks with lint-staged
fix(tsconfig): remove deprecated baseUrl, enable strict mode
feat(health): add basic health check endpoint
feat(config): add Zod-validated ConfigModule
feat(cache): implement in-memory ICacheService with TTL
feat(google-places): implement place ID resolver and Google adapter
feat(analysis): implement rules engine and scoring aggregation
feat(api): add POST /analysis endpoint with DTO validation
docs(swagger): add OpenAPI decorators to analysis endpoint
test(analysis): cover rules engine with unit tests
docs(readme): add setup and architecture overview
```

## The rule that matters more than the table above

One logical change per commit. If you're about to write "and" in the commit message to cover two unrelated things, split it into two commits instead.

## Subject only vs. subject + body

- **Small change (one file, one clear reason):** subject line only, no body.

```bash
  fix(tsconfig): remove deprecated baseUrl
```

- **Larger change (several files, several distinct additions under one theme that genuinely belong in one commit — not several unrelated changes):** subject line, blank line, then a bullet list body. One bullet per meaningful change, each in imperative mood, each naming the specific file/thing touched.

```bash
  feat(agents): add agent hooks and stop-event logging

  - Add `.agents/hooks.json` defining PreToolUse and Stop hooks.
  - Add `pre_command.sh` to log pre-command execution events.
  - Add `on_stop.sh` to log session stop events.
  - Add api architecture documentation in `.agents/rules/api.md`.
```

If the bullets don't share one clear theme, that's a signal the change should be split into separate commits instead of stretching one subject line to cover all of it.

## For AI Agents: Generating Commits

When the user requests a commit message, DO NOT write it to a file. Follow the rules in this document, decide subject-only vs. subject+body based on the size/shape of the actual staged diff (do not default to a body just because it's available), and output the full command directly in the chat inside a `bash` markdown code block so the user can copy it with one click.

**Subject-only:**

```bash
git commit -m "fix(tsconfig): remove deprecated baseUrl"
```

**Subject + body:** Output the commit using a standard multi-line string with double quotes. Do not use `-m` multiple times and do not use heredoc syntax (`cat <<EOF`), as it can cause the terminal to hang.

```bash
git commit -m "feat(agents): add agent hooks and stop-event logging

- Add .agents/hooks.json defining PreToolUse and Stop hooks.
- Add pre_command.sh to log pre-command execution events.
- Add on_stop.sh to log session stop events.
- Add api architecture documentation in .agents/rules/api.md."
```
