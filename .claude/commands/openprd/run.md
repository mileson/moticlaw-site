<!-- OPENPRD:GENERATED
adapter=claude
source=command:run
version=0.1.0
checksum=27d8b93a7a2fcb45
-->

# OpenPrd Run

Use the hook-stable OpenPrd execution loop. Start with `openprd run . --context`, execute the recommended task/discovery/workflow action, then run `openprd run . --verify` before claiming completion.

Intent gate: `openprd run . --context` is advisory. Execute mutating recommendations only when the current user message explicitly asks for development, implementation, task continuation, deep research/benchmarking, replication, or commit. Stay read-only for planning, analysis, review, explanation, and file-impact questions.

Always rebuild state from `.openprd/` before acting.
