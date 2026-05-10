---
name: openprd-diagram-review
description: Generate and review OpenPrd architecture and product-flow diagrams before freeze.
---

<!-- OPENPRD:GENERATED
adapter=claude
source=openprd-diagram-review
version=0.1.0
checksum=3ed24a58f890377a
-->

# OpenPrd Diagram Review

Use this skill when architecture, product flow, user journey, or visual confirmation is needed.

- Generate architecture diagrams with `openprd diagram . --type architecture`.
- Generate product-flow diagrams with `openprd diagram . --type product-flow`.
- Use `--mark confirmed` only after the user has reviewed the artifact.

## Contract Language

- Diagram contracts are user-facing. When `locale` is `zh-CN`, write all visible text in Simplified Chinese.
- This includes `title`, `subtitle`, `components[].name`, `components[].subtitle`, `components[].details`, `flows[].label`, `summaryCards[].title`, `summaryCards[].items`, `sidePanels[].title`, `sidePanels[].items`, and `reviewInstructions`.
- Keep necessary product names, framework names, protocol names, command names, file paths, and field keys unchanged: examples include MotiClaw, Electron, TypeScript, CLI, API, JSON, NDJSON, dry-run, Host API, schema, `waiting_approval`.
- Do not write full English sentences in zh-CN diagram contracts. Translate the sentence and preserve only necessary terms.
- Before running `openprd diagram --input`, inspect the contract once and rewrite English-heavy visible text into Simplified Chinese.

## Review Gate

- Diagram output is not confirmation.
- Confirmation requires the user or project owner to accept the structure.
- If the diagram affects implementation, sync `docs/basic/app-flow.md`, `docs/basic/backend-structure.md`, or `docs/basic/frontend-guidelines.md`.
