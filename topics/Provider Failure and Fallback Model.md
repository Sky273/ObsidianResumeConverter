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

Current durable behavior for resume analysis as of 2026-04-16:

- analysis requests now run with deterministic structured-output settings (`temperature: 0`)
- malformed JSON no longer stops after a single parse failure
- the flow now attempts, in order:
  - normal structured analysis
  - compact-JSON retry
  - JSON repair pass that asks the provider to repair the malformed payload into valid compact JSON
- local parsing also strips BOM/NUL characters and repairs some trailing-comma/control-character issues before giving up
- local parsing now also repairs a common provider defect where a comma is missing between two JSON properties, which previously surfaced as `Expected ',' or '}' after property value`
- local parsing also tolerates JSON comments, smart quotes, duplicate separators, and root-level missing closing braces/brackets when the payload is otherwise structurally unambiguous
- local repair deliberately does not try to invent the end of a string value truncated mid-field; those cases still fall through to retry / repair-pass logic
- the analysis flow no longer imposes a hardcoded output-token default; when no request-level max-token override is provided, runtime token limits still come from the configured model/provider parameters

Current durable behavior for resume analysis as of 2026-04-17:

- when all JSON-oriented recovery attempts still fail, the backend now performs one final local salvage pass on the provider text
- this salvage path accepts loose Markdown / `key: value` output and reconstructs a minimal analysis payload when it can recover fields such as candidate name, title, ratings, top skills/tools, and section suggestions
- this reduces user-facing hard failures on providers that ignore `json_object` but still return semantically useful analysis text
- degraded-analysis salvage now logs provider/model hints, detected loose-response shape, recovered fields, missing fields, per-section counts, and a short response preview so low-capability local models can be diagnosed from backend logs
- if the loose-text salvage cannot recover any meaningful structure, the original stable invalid-response error is still returned

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
- As of 2026-04-24, resume improvement also performs a bounded malformed-JSON field salvage after the compact JSON retry fails:
  - it only extracts complete string values from known output fields such as `structuredText`, `html`, `improvedText`, `content`, or `text`
  - it returns empty improvement analysis metadata for that degraded path rather than inventing scores or tags
  - provider/auth failures and deadline failures are still not hidden by this salvage path
- This is an output-contract fallback, not a provider failover.

### Request-level parameter precedence

- request-level `maxTokens` / `max_tokens` overrides take precedence over persisted model parameters in the LLM control plane
- this matters for AI operation budgets because per-action max-token settings must remain the effective runtime ceiling, even when model defaults or admin parameters also define token values

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
