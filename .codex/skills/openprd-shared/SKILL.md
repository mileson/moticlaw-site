---
name: openprd-shared
description: Shared rules for OpenPrd workspaces, language policy, gates, and workspace-first reasoning.
---

<!-- OPENPRD:GENERATED
adapter=codex
source=openprd-shared
version=0.1.0
checksum=2cea7d0057649aab
-->

# OpenPrd Shared

Use this rulebook for all OpenPrd work.

## Read Set

- `.openprd/state/current.json`
- `.openprd/state/task-graph.json`
- `.openprd/harness/install-manifest.json`
- `.openprd/harness/hook-state.json`
- `docs/basic/`

## Operating Rules

- Rebuild context from `.openprd/` before acting.
- Prefer `openprd status .` and `openprd next .` before choosing a mutating command.
- User-facing docs, progress logs, proposals, prompts, and reports should use Simplified Chinese by default; keep only necessary proper nouns, command names, file paths, field names, and API terms in their original form.
- Diagram contracts are user-facing artifacts: `title`, `subtitle`, component names/subtitles/details, flow labels, summary cards, side panels, and review instructions must be written in Simplified Chinese when `locale` is `zh-CN`.
- Time shown to users must use Shanghai time in `YYYY-MM-DD HH:mm:ss` format, without `T`, `Z`, or millisecond suffixes.
- Keep unresolved assumptions visible.
- Use `docs/basic/` as the only project baseline docs path.
- Do not claim readiness until `openprd validate .` and `openprd standards . --verify` pass.
- If generated agent files look stale, run `openprd doctor .` before guessing.
- OpenPrd context is advisory. Planning, analysis, review, explanation, and file-impact questions must stay read-only unless the current user message explicitly asks for development, implementation, task continuation, deep research, benchmarking, replication, or commit/push.
- For every implementation that adds or modifies files, perform a documentation impact check: missing `docs/basic/`, file manuals, or folder README docs must be created; existing ones must be reviewed and updated when the change affects responsibilities, flows, structure, dependencies, or product behavior.
- Codex hooks default to the lite profile: one `UserPromptSubmit` hook, no per-tool PreToolUse/PostToolUse hooks. Full gate hooks are opt-in for high-risk workflows.
- Lite hooks should inject OpenPrd context only when the prompt explicitly mentions OpenPrd, PRD, deep research/benchmarking, replication, standards, fleet, or documentation standards.

## Write Discipline

- Read-only commands first: `status`, `next`, `validate`, `standards --verify`, `doctor`.
- Mutating commands only after the next gate is understood.
- Never run `openprd loop --run`, `openprd tasks --advance`, `openprd discovery --advance`, `openprd loop --finish --commit`, git commit, or git push for a planning/analysis/review request.
- When code changes are made, state whether baseline docs, file manuals, and folder README docs were created, updated, or intentionally left unchanged with a brief reason.
- High-risk commands require green gates: `freeze`, `handoff`, `change --apply`, `change --archive`, commits, pushes, releases, and publishing.

## Repair Path

1. Run `openprd doctor .`.
2. Run `openprd update .` if generated guidance or hooks drifted.
3. Run `openprd standards . --verify` and repair docs/manual standards.
4. Run `openprd validate .` before reporting readiness.
