# ProfileLens: Agent Context & System Architecture

## 1. System Overview

You are an expert Full-Stack Engineer building **ProfileLens**, an MVP tool for analyzing Google Business Profile optimization.
The system evaluates a Google Maps link or Place ID, calculates a score (0–100), and provides actionable recommendations.

## 2. Workspace Layout

This is a monorepo. API and (future) web clients live in separate subfolders — never assume the working directory is the repo root when running commands.
Note: We will do most of the development directly in VS Code. Docker is primarily included so the project is ready for deployment to any server (set up once and forget).

- **`apps/api/`** — NestJS REST API (Phase 1, complete). All paths in `.agents/rules/api.md` are relative to `apps/api/`, not repo root.
- **`apps/web/`** — Next.js App Router (Phase 2, active). All paths in `.agents/rules/web.md` are relative to `apps/web/`, not repo root.

**Golden Rule:** Never couple api logic with web rendering. Always return strict, predictable JSON envelopes (`{ success, data, meta }`).

## 3. Before You Do Anything

1. Read `.agents/state-api.md` & `.agents/state-web.md` — they track which tasks are already done. Do not redo completed work or skip ahead of the current task without being asked.
2. Read the relevant rules file for the area you're working in — see the Workspace Layout above and the Context Map below.

## 4. Agent Directory Structure (`.agents/`)

This directory serves as the "AI brain" of the project. It stores all instructions, constraints, and tracking logic. Always consult these folders to understand the project context:

- **`rules/`** — Mandatory code standards and constraints.
  - Read `.agents/rules/global.md` (Workflow & TS standards)
  - Read `.agents/rules/commits.md` (Git commit conventions)
  - Read `.agents/rules/api.md` (NestJS architecture rules — `apps/api/` only)
  - Read `.agents/rules/web.md` (Next.js architecture rules — `apps/web/` only)
- **`context/`** — Architectural rationale, technical limitations, and domain knowledge.
  - Read `.agents/context/api-architecture.md` (Why decisions were made — consult if api rules are unclear)
  - Read `.agents/context/web-architecture.md` (Why decisions were made — consult if web rules are unclear)
  - Read `.agents/context/google-places-limitations.md` (API quirks and quotas)
- **`skills/`** — Detailed instructions for specialized domain implementations.
  - Read `.agents/skills/google-places.md` (How to interact with Google API)
- **`workflows/`** — Step-by-step guides for repeatable processes.
  - Follow `.agents/workflows/new-rule.md` (Creating a new api analysis rule)
  - Follow `.agents/workflows/new-api-module.md` (Creating a new api NestJS module)
  - Follow `.agents/workflows/new-web-component.md` (Creating a new web Next.js component)
- **`changelog/`** — History logs. Contains `current_task.txt` (active subtask) and `history.md`.
- **`state-api.md` & `state-web.md`** — The single sources of truth for tracking implementation progress.

## 5. Progress Tracking

After completing any checklist item from `state-api.md` or `state-web.md`, update the corresponding file: tick the box, add today's date and a detailed description of everything that was done for this task. Do not leave state files stale — they are the source of truth for what's already built and exactly how it was implemented.
**Mandatory Requirement:** Every completed task MUST include the following exact line at the end of its checklist: `- [x] Passed strict \`eslint\` and \`typecheck\` validations — done`. You must actually run and pass these checks before adding this line.

## 6. Scope Discipline

Unlike Claude Code, this environment has NO automatic sibling-directory isolation — rules files are loaded by explicit reference (Context Map above), not by physical cwd. This means when working in `apps/api/`, nothing technically prevents `apps/web/`-related conventions from leaking into the same context if they were read earlier in the session — YOU are the only safeguard.

When switching between `apps/api/` and `apps/web/` work within the same session: explicitly drop the previous area's rules file from active consideration before reading the new one. Never apply `api.md` conventions to web code, or vice versa. If unsure which area a change belongs to, ask before proceeding — there is no mechanical fallback here.
