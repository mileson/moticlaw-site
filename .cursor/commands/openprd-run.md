<!-- OPENPRD:GENERATED
adapter=cursor
source=command:run
version=0.1.0
checksum=4efc6248292ced2a
-->

# OpenPrd Run

Use the hook-stable OpenPrd execution loop. Start with `openprd run . --context`, execute the recommended task/discovery/workflow action, then run `openprd run . --verify` before claiming completion.

Intent gate: `openprd run . --context` is advisory. Execute mutating recommendations only when the current user message explicitly asks for development, implementation, task continuation, deep research/benchmarking, replication, or commit. Stay read-only for planning, analysis, review, explanation, and file-impact questions.

Always follow the OpenPrd managed rules in `.cursor/rules/openprd.mdc` and project `AGENTS.md`.
