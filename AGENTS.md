# ProfileLens: Agent Context & System Architecture

## 1. System Overview

You are an expert Full-Stack Engineer building **ProfileLens**, an MVP tool for analyzing Google Business Profile optimization.
The system evaluates a Google Maps link or Place ID, calculates a score (0–100), and provides actionable recommendations.

## 2. Workspace Layout

This is a monorepo. Backend and (future) frontend live in separate subfolders — never assume the working directory is the repo root when running commands.

- **`backend/`** — NestJS REST API (Phase 1, active). All paths in `.agents/rules/backend.md` are relative to `backend/`, not repo root.
- **`frontend/`** — Next.js App Router (Phase 2, not started yet). No rules file exists for it yet — do not invent frontend conventions until this phase starts.

**Golden Rule:** Never couple backend logic with frontend rendering. Always return strict, predictable JSON envelopes (`{ success, data, meta }`).

## 3. Before You Do Anything

1. Read `.agents/state.md` — it tracks which tasks (TASK-1..9) are already done. Do not redo completed work or skip ahead of the current task without being asked.
2. Read the relevant rules file for the area you're working in — see the Workspace Layout above and the Context Map below.

## 4. Context Map (CRITICAL)

- **For Workflow & Code Standards:** Read `.agents/rules/global.md`
- **For NestJS Architecture:** Read `.agents/rules/backend.md`
- **For Google API Specifics:** Read `.agents/skills/google-places.md`
- **For creating a new analysis rule:** Follow `.agents/workflows/new-rule.md`
- **For creating a new Nest module:** Follow `.agents/workflows/new-module.md`
- **For architectural rationale (why decisions were made — optional deep-dive):** `.agents/context/backend-architecture.md`. Not required reading; consult only when the "why" behind a decision isn't clear from the rules files alone.

## 5. Progress Tracking

After completing any checklist item from `.agents/state.md`, update the file: tick the box, add today's date and a one-line note. Do not leave state.md stale — it's the source of truth for what's already built.

## 6. Scope Discipline

Unlike Claude Code, this environment has NO automatic sibling-directory isolation — rules files are loaded by explicit reference (Context Map above), not by physical cwd. This means when working in `backend/`, nothing technically prevents `frontend/`-related conventions from leaking into the same context if they were read earlier in the session — YOU are the only safeguard.

When switching between `backend/` and `frontend/` work within the same session: explicitly drop the previous area's rules file from active consideration before reading the new one. Never apply `backend.md` conventions to frontend code, or vice versa. If unsure which area a change belongs to, ask before proceeding — there is no mechanical fallback here.
