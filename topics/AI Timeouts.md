# AI Timeouts

## Summary

The main IA stack was standardized around a 15-minute timeout baseline.

## Current State

- server constant:
  - `LLM_OPERATION_TIMEOUT_MS = 15 * 60 * 1000`
- frontend constant:
  - `FRONTEND_LLM_OPERATION_TIMEOUT_MS = 15 * 60 * 1000`

## Important Facts

- Several providers previously used inconsistent defaults such as 90 seconds, 120 seconds, or 5 minutes.
- The timeout was centralized in the backend config and propagated through the gateway and provider services.
- Key frontend IA flows were aligned to avoid client-side expiry before backend completion.
- Batch upload job timeout remains longer and should be treated separately unless there is an explicit product decision to shorten it.

## Known Scope

The 15-minute baseline was applied to the main IA server stack and key user-facing frontend IA flows, including provider routing and proxy paths.

## Related

- [[topics/AI Credits]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
