---
name: openprd-standards
description: Initialize and verify docs/basic, file manual, and folder README standards.
---

<!-- OPENPRD:GENERATED
adapter=codex
source=openprd-standards
version=0.1.0
checksum=f11b353a832715c9
-->

# OpenPrd Standards

Use this skill whenever docs, file manuals, folder manuals, or implementation readiness are in scope.

## Required Docs

- `docs/basic/file-structure.md`
- `docs/basic/app-flow.md`
- `docs/basic/prd.md`
- `docs/basic/frontend-guidelines.md`
- `docs/basic/backend-structure.md`
- `docs/basic/tech-stack.md`

Run `openprd standards . --verify` before reporting implementation readiness.
For projects with source files, this gate also requires concrete `docs/basic/` content, file-header manuals, and `[project]_[folder]_README.md` folder manuals.

## Documentation Impact Check

- Before editing, identify the files, folders, user flows, architecture boundaries, dependencies, and product behavior likely to change.
- Added source file: add a file manual if it is missing and ensure the containing folder README exists.
- Modified source file: read the existing file manual when present; update it if the file responsibilities, inputs, outputs, dependencies, or maintenance rules changed.
- Added, moved, removed, or repurposed folder content: add or update the folder README so it reflects the current folder responsibility and file layout.
- Feature, flow, architecture, dependency, or product behavior changed: update the relevant `docs/basic/` document even when the file already exists.
- If a required doc/manual is absent or still template-like, supplement it before claiming readiness.
- If no documentation file needs changes, mention that the impact check was performed and why no update was needed.

## Synchronization Triggers

- File or folder moved, added, or deleted: update `docs/basic/file-structure.md` and relevant folder README.
- Product flow, state, route, or task behavior changed: update `docs/basic/app-flow.md`.
- User-facing capability or acceptance criteria changed: update `docs/basic/prd.md`.
- Framework, dependency, runtime, or build command changed: update `docs/basic/tech-stack.md`.
- Frontend or backend structure changed: update the matching `docs/basic/` guide.

## Gate

`openprd standards . --verify` must pass before freeze, handoff, accepted spec apply/archive, commit, push, release, or publishing.
