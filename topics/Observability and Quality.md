# Observability and Quality

## Summary

ResumeConverter has a mature quality and observability posture compared with many small internal apps, including tests across backend, client, PDF server, and e2e flows.

## Validation Structure

Core validation order documented in CI:

1. typecheck
2. backend tests
3. client tests
4. PDF tests
5. Playwright e2e

This order is intended to localize failures early and cheaply.

## Runtime Observability

The app exposes dedicated metrics and operational diagnostics for:

- requests and performance
- errors
- cache
- LLM usage
- OCR runtime
- storage
- cleanup behavior
- database metrics

## Audit Posture

The backend audit shows that the project already invested in:

- multi-firm isolation review
- admin-route alignment
- route validation and pagination hardening
- worker lifecycle correctness
- OAuth/callback integrity
- error sanitization

## Important Facts

- Quality in this project is not just unit tests; it includes cache-refresh behavior, stale-view detection, and security/access guarantees.
- Metrics and diagnostics are rich enough to be considered part of the operational product surface.
- The audit history is itself a durable signal about what the team considers risky.
- The setup docs also define stable E2E reference flows:
  - `upload -> analysis`
  - `analysis -> improve -> export`
- Playwright authentication is intentionally helper-driven with JWT cookie bootstrapping instead of relying only on UI signin flows.
- Cache behavior should be understood as part of correctness, not only performance, because scope-version invalidation is part of the data-consistency contract.

## Related

- [[topics/Auth and Access Model]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Admin and Operations]]
- [[topics/Application Cache Model]]
- [[topics/Product Scope and Priorities]]

## Sources

- [[raw/sources/2026-04-16-backend-audit-and-quality]]
- [[raw/sources/2026-04-16-codebase-structure]]
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]
- [[raw/sources/2026-04-16-cache-architecture]]
