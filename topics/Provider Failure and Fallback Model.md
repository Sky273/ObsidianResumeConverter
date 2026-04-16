# Provider Failure and Fallback Model

## Summary

ResumeConverter does not treat all LLM failures the same way. The runtime distinguishes between:

- configuration/auth failures
- malformed-content failures
- timeout or transient provider failures
- model/runtime availability fallback

This matters because retry behavior, user messaging, and operational response differ by category.

## Runtime Resolution First

Before a feature talks to a provider, the app resolves:

1. configured provider and model
2. runtime availability state
3. effective model selection
4. per-call parameters and prompt context

So a failure should be understood as happening after a resolution phase, not at a direct `feature -> provider` call edge.

## Main Failure Classes

### Provider auth or configuration failure

Examples:

- expired token
- incorrect API key
- provider credentials missing or broken

These are normalized as non-retryable provider errors.

Current durable behavior:

- `llmGateway.service.js` detects provider-auth style failures
- they are normalized to a stable application error
- they are marked `retryable = false`
- they map to a controlled user-facing message instead of leaking raw provider text

For resume improvement specifically, the worker further rewrites this into a feature-specific message explaining that the improvement service is unavailable because the provider is misconfigured or expired.

### Malformed structured output

Examples:

- invalid JSON from the model
- structured-response contract not respected

These are often retried once with stricter or more compact JSON instructions.

This is not provider failover; it is prompt/response-shape recovery within the same provider path.

### Empty or low-quality content

Examples:

- empty improvement body
- invalid analysis payload

These are typically handled as feature-level failures and may trigger a local fallback path, such as plain-text fallback after structured JSON fails.

### Timeout or transient provider failure

Examples:

- slow provider response
- upstream 5xx
- network instability

These are the failures most likely to remain retryable. They should be thought of as operational/provider instability rather than misconfiguration.

## Fallback Types

ResumeConverter currently uses several different notions of fallback.

### Runtime provider/model resolution fallback

- Settings may nominally point to one provider/model.
- Availability logic may still resolve a different effective runtime path.
- This is a control-plane fallback before the actual provider call is made.

### Response-shape fallback

- A call can retry with stricter JSON instructions.
- Improvement can fall back from structured JSON expectations to a plain-text style recovery path.
- This is an output-contract fallback, not a provider failover.

### User-message fallback

- Raw provider errors are sanitized into stable product messages.
- This reduces accidental leakage of provider internals and makes frontend behavior more consistent.

## Worker and Batch Semantics

- Batch improvement explicitly distinguishes non-retryable provider-auth failures from retryable failures.
- Non-retryable failures do not consume pointless extra retries.
- This is important because batch retries otherwise amplify noise and user confusion.

## Practical Reading

- If users see a stable message about provider configuration, investigate credentials/settings first.
- If users see malformed-response behavior, investigate prompt contract or provider response quality.
- If failures are intermittent and slow, investigate timeout/upstream availability.
- If behavior differs from configured provider/model, inspect runtime resolution and availability state before assuming a bug.

## Related

- [[topics/LLM Control Plane]]
- [[topics/LLM Call Resolution and Runtime Selection]]
- [[topics/AI Timeouts]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Maintenance and Cleanup Jobs]]

## Sources

- [[raw/sources/2026-04-16-provider-failure-runbooks-authz]]
