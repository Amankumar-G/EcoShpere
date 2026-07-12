---
name: pull-request
description: Pull request conventions for this repo — branch/title naming, a well-described PR body, required CI checks, and no AI attribution. Use whenever creating or updating a pull request.
---

# Pull Request Workflow

## No AI attribution

Never add any Claude/AI attribution to PRs or their commits:

- No `🤖 Generated with [Claude Code](...)` footer in the PR body.
- No `Co-Authored-By: Claude ...` trailer in any commit.
- The PR body ends with the last content section — no attribution footers of any kind.

## Branch naming

Branch from `main`. Name the branch after the PR type, mirroring the commit convention:

- `feat/<short-slug>`, `fix/<short-slug>`, `chore/<short-slug>`, `refactor/<short-slug>`, `docs/<short-slug>`, `ci/<short-slug>`

## PR title naming convention

Match the repo's commit style — `<type> : <short description>` (space around the colon):

- `feat : add emission entry form`
- `fix : correct scope-2 calculation rounding`
- `chore : bump docker base image`
- `refactor : extract report service`

Keep the title under ~70 characters, imperative mood, lowercase description.

## PR description (required structure)

Every PR must be well described. Use this template:

```markdown
## Summary
2–4 sentences: what this PR does and why it's needed.

## Changes
- Bullet list of the concrete changes, grouped by area (client/server/infra).

## How to test
Step-by-step instructions to verify the change locally
(commands to run, endpoints to hit, UI flows to click through).

## Screenshots
(UI changes only — before/after screenshots or a short recording.)

## Notes
Anything reviewers should know: trade-offs, follow-ups, known limitations.
(Omit this section if there's nothing to note.)
```

## CI must pass before merge

PRs to `main` trigger path-filtered GitHub Actions checks that must be green before merge:

- **Server CI** (`.github/workflows/server-ci.yml`) — runs on changes under `server/**`. Steps: install → `pnpm orm:sync` → `pnpm lint:check` → `pnpm test` → `pnpm build`.
- **Client CI** (`.github/workflows/client-ci.yml`) — runs on changes under `client/**`. Steps: install → `pnpm format:check` → `pnpm exec tsc --noEmit` → `pnpm build`.

Run the relevant checks locally before opening the PR (see the `development` skill) so the PR lands green. A PR that only touches one app won't trigger the other app's workflow — that's expected.

## Workflow

- Follow the commit rules in the `development` skill (feature-scoped commits, max 5 files each, no attribution trailers).
- Push the branch and open the PR with `gh pr create --base main`; review the final title and body before submitting.
- Keep PRs small and single-purpose — if the change spans multiple features, split into multiple PRs.
- After opening, confirm CI is green (`gh pr checks`) and address any failures before requesting review.
