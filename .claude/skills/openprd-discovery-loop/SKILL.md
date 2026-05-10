---
name: openprd-discovery-loop
description: Sustained OpenPrd discovery for existing projects, reference mining, and unclear requirements.
---

<!-- OPENPRD:GENERATED
adapter=claude
source=openprd-discovery-loop
version=0.1.0
checksum=1e04249057bc2d88
-->

# OpenPrd Discovery Loop

Use this skill when the user asks to continue, deepen, complete, compare, replicate, or comprehensively mine requirements.

## Loop

- Start or resume with `openprd discovery . --mode <brownfield|reference|requirement>`.
- Advance one evidence-backed coverage item at a time.
- Verify with `openprd discovery . --verify` before reporting the run as healthy.
- Keep standards current through `openprd standards . --verify`.

## Depth Rules

- Each claim needs source, evidence path, and confidence.
- Do not convert inferred behavior into accepted requirements without surfacing it as reviewable.
- Large task files must be sharded and verified.
- Stop only when coverage is exhausted, blocked, or explicitly handed off.
