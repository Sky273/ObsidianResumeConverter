# Codex Agent Tooling

## Summary

The local Codex environment for ResumeConverter now includes a custom `karpathy-guidelines` skill that adapts the behavioral guidance from `forrestchang/andrej-karpathy-skills` to Codex's skill format.

## Current State

- Installed skill path: `C:\Users\mail\.codex\skills\karpathy-guidelines`
- UI metadata path: `C:\Users\mail\.codex\skills\karpathy-guidelines\agents\openai.yaml`
- The skill is intentionally lightweight and contains guidance only; it does not bundle scripts, assets, or references.

## Important Facts

- The skill was created as a native Codex skill instead of reusing the upstream Claude-oriented packaging directly.
- The adapted guidance is centered on four operating constraints:
  - think before coding
  - simplicity first
  - surgical changes
  - goal-driven execution
- The installed skill validated successfully with the Codex `quick_validate.py` helper.
- Because skill discovery happens at startup, Codex should be restarted after installation if the skill does not appear immediately.

## Related

- [[overview]]
- [[raw/sources/2026-04-16-karpathy-codex-skill-install]]

## Sources

- [[raw/sources/2026-04-16-karpathy-codex-skill-install]]
