---
name: development
description: Development workflow conventions for this repo — pnpm monorepo layout, pre-commit verification matching CI, and commit style/cadence. Use whenever writing code, making changes, or committing in this project.
---

# Development Workflow

## Repo layout

This is a pnpm monorepo with two independently-built apps:

- `server/` — NestJS 11 + Prisma 7 (PostgreSQL). Package manager: pnpm. Tests: vitest.
- `client/` — Next.js (App Router) + shadcn/ui. Package manager: pnpm.

Run commands from inside the app directory you're changing (`server/` or `client/`), not the repo root.

## Before you commit — verify like CI does

A PR only merges once its GitHub Actions checks are green, so run the same checks locally before committing. Run only the checks for the app(s) you touched:

**Server (`server/`)** — mirrors `.github/workflows/server-ci.yml`:

```bash
pnpm orm:sync      # generate Prisma client
pnpm lint:check    # eslint, no autofix (CI uses this, not `lint`)
pnpm test          # vitest run
pnpm build         # nest build
```

**Client (`client/`)** — mirrors `.github/workflows/client-ci.yml`:

```bash
pnpm format:check    # prettier --check .
pnpm exec tsc --noEmit
pnpm build           # next build
```

If a check fails, fix it before committing — don't push a red PR. Use `pnpm lint` / `pnpm format` to autofix, then re-run the `:check` variant to confirm.

## Commit rules

1. **No AI attribution.** Never add a `Co-Authored-By: Claude ...` trailer or any `Generated with ...` footer. The commit message ends with the description — no trailers, no attribution footers.

2. **Frequent, feature-scoped commits.** Commit early and often as work progresses:
   - Each commit maps to one logical feature/fix/chore — never bundle unrelated changes.
   - **Max 5 file changes per commit.** If a feature touches more than 5 files, split it into multiple smaller commits (e.g. schema first, then service layer, then routes, then UI), each of which still builds/makes sense on its own.
   - Don't wait until the whole task is done to commit — commit each completed slice as you go.

3. **Message format.** Follow the existing repo convention (`<type> : <description>`, note the space around the colon — see `git log`). Use a recognized conventional-commit type:
   - `feat : <description>` — new feature
   - `fix : <description>` — bug fix
   - `chore : <description>` — maintenance, deps, config
   - `refactor : <description>` — behaviour-preserving restructure
   - `docs : <description>` — docs only
   - `test : <description>` — tests only
   - `ci : <description>` — CI/workflow changes
   - `build : <description>` — build system / Dockerfile / tooling
   - `style : <description>` — formatting only (prettier/lint), no logic change

   Keep the description short, imperative, and lowercase.

## Workflow

- Before committing, run `git status` and `git diff --stat` to confirm the changeset is ≤ 5 files and single-purpose.
- Stage files explicitly by path (`git add <file> ...`) — avoid `git add -A` so unrelated files don't sneak in.
- Never commit secrets. Server config comes from env (`server/.env.example` documents the keys); keep real `.env` files untracked.
