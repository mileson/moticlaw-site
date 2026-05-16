---
name: site-release-path
description: Default production release path for this site project: commit and push to GitHub main, then rely on Vercel auto-deploy instead of routine manual Vercel production deploys.
---

# Site Release Path

Use this project skill whenever the user asks to deploy, publish, release, or put the website live.

## Intent

This repository already has GitHub connected to Vercel. The default production release path is:

1. Isolate the approved website diff.
2. Run the required build and OpenPrd gates.
3. Commit the change.
4. Push to `origin/main`.
5. Let Vercel auto-deploy from GitHub.
6. Verify `www.moticlaw.com` after the deployment is ready.

## Default Rules

- Prefer GitHub push-triggered Vercel deployment over routine manual `vercel deploy --prod`.
- Treat manual Vercel production deploys as an exception path, not the baseline workflow.
- If the current worktree contains unrelated local changes, create a clean worktree or otherwise isolate the intended release diff before committing.
- Do not publish uncommitted local-only changes and then leave GitHub behind; the repository history should remain the source of truth for production.

## Verification Checklist

- `pnpm build`
- `openprd standards . --verify`
- `openprd quality . --verify`
- `openprd run . --verify`
- `openprd doctor .`

If one of the OpenPrd checks is advisory-only but the project uses it as part of the standard high-risk gate review, report that clearly before pushing.

## Exception Path

Manual Vercel production deploy is allowed only when at least one of these is true:

- The user explicitly asks for a manual Vercel deploy.
- GitHub -> Vercel integration is unavailable or unhealthy.
- An urgent recovery or rollback requires bypassing the normal Git-triggered path.

When using the exception path, explain why the bypass was necessary and still bring GitHub back in sync afterward.
