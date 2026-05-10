---
name: openprd-harness
description: Drive an OpenPrd workspace through clarify, synthesize, diagram, freeze, handoff, change, tasks, and verification.
---

<!-- OPENPRD:GENERATED
adapter=codex
source=openprd-harness
version=0.1.0
checksum=7669b100885218b4
-->

# OpenPrd Harness

Use this skill whenever a user asks for product planning, requirement refinement, implementation preparation, or execution readiness.

## Default Flow

1. Run `openprd run . --context` for the hook-stable execution view.
2. Classify the current user intent before following any recommendation.
3. For planning, analysis, architecture review, "how would we change this?", or "which files are involved?" requests, stay read-only and answer from code/docs/state evidence.
4. Run `openprd status .` and `openprd next .` when you need full workflow detail.
5. If facts are missing, ask or capture them with `openprd clarify .` and `openprd capture .`.
6. If a PRD needs to become work, run `openprd change . --generate --change <id>` only when the user asked for implementation preparation.
7. For long-running implementation, run `openprd loop . --plan --change <id>` and execute one loop task per fresh agent session only when the user explicitly asks to develop, continue a task, deeply research/benchmark, replicate, or commit.
8. During implementation, run a documentation impact check for every added or modified file. Create missing `docs/basic/`, file manuals, or folder README docs; update existing docs when responsibilities, flows, structure, dependencies, or product behavior changed.
9. Before readiness, run `openprd standards . --verify` and `openprd run . --verify`.

## Gate Protocol

- Never skip `openprd run . --context`; it is the hook-friendly control surface.
- Do not treat `run --context` recommendations as direct user commands.
- Do not run mutating OpenPrd commands for read-only intent words such as 看看, 规划, 梳理, 分析, 评估, 怎么改, 预计动哪些文件, review, or explain.
- For existing projects, prefer discovery before synthesis when requirements are under-specified.
- Before freeze or handoff, run `openprd run . --verify` and confirm review blockers are resolved.
- For accepted spec promotion, run `openprd change . --validate --change <id>` before `--apply` or `--archive`.

## Hook-Driven Loop

- Treat `.openprd/harness/run-state.json` and `iterations.jsonl` as the durable loop state.
- Default lite hooks do not record every turn. They inject context only for explicit OpenPrd/deep-work prompts so small one-line tasks stay lightweight.
- Use `--hook-profile guarded` for high-risk PreToolUse gates, or `--hook-profile full` only when the project truly needs full hook telemetry.
- When context is injected, hooks recommend the next task/discovery/workflow action from OpenPrd state.
- A failed gate leaves the task or coverage item unfinished, so the next run retries the same unit.
- Record reusable learnings in `.openprd/harness/learnings.md`, local `AGENTS.md`, or `docs/basic/` when they apply beyond one story.

## Long-Running Implementation Loop

- Run `openprd loop . --init`, then `openprd loop . --plan --change <id>` to create `.openprd/harness/feature-list.json`.
- Use `openprd loop . --next` to identify the next dependency-ready task.
- Use `openprd loop . --run --agent codex --dry-run` or `openprd loop . --run --agent claude --dry-run` to generate the exact one-task prompt and launch command.
- Use `openprd loop . --run` only after the current user message explicitly asks to execute development, continue a task, or perform deep research/benchmarking. A planning question never authorizes loop execution by itself.
- Each loop task is the full boundary for one fresh agent session. Do not continue into the next task inside the same session.
- Finish the task with `openprd loop . --finish --item <task-id> --commit` only after the task verify command and `openprd run . --verify` pass, and only when commit is explicitly part of the requested execution.
- For frontend UI work, Codex desktop should prefer Computer Use; Codex CLI and Claude Code should prefer Playwright, MCP browser automation, or the project e2e tool.
- `openprd loop . --finish` writes `.openprd/harness/test-reports/<task-id>.md`; commit this staged test report together with the task.
- Keep `.openprd/harness/feature-list.json`, `progress.md`, `agent-sessions.jsonl`, `loop-state.json`, `loop-prompts/`, and `test-reports/` as durable implementation state.

## Failure Protocol

- If a command fails, do not continue by intuition.
- Run `openprd run . --context`, `openprd doctor .`, and use the reported repair command.
- Keep failed assumptions in `.openprd/engagements/active/open-questions.md` when they affect product scope.

## Historical Projects

- Use `openprd fleet <root> --dry-run` before touching multiple old projects.
- Use `openprd fleet <root> --update-openprd` to refresh only projects that already contain `.openprd/`.
- Do not use `--setup-missing` unless the user explicitly wants OpenPrd to claim agent-only or plain projects.
