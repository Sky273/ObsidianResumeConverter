# LLM Call Resolution and Runtime Selection

## Summary

In ResumeConverter, an LLM call is resolved through configuration before any provider adapter is invoked. The application does not simply call one provider directly from each feature. It computes the effective provider, effective model, effective parameters, and only then dispatches through the gateway.

## Resolution Flow

The runtime path is broadly:

1. load canonical LLM settings
2. determine configured provider
3. determine requested or configured model
4. normalize model for that provider
5. check runtime availability and possible fallback
6. merge effective model parameters and per-call overrides
7. dispatch through the provider gateway
8. normalize the response into the expected caller shape
9. sanitize provider-auth/configuration errors when needed

## Settings Source

Business flows typically start from `getLLMSettings()`.

Important behavior:

- settings are cached
- if fresh DB retrieval fails, stale cached settings may still be used
- this makes the LLM layer more resilient to transient settings-read failures

## Provider Resolution

The configured provider comes from settings. If nothing explicit is set, the system falls back to the default provider model pair.

Observed provider defaults include:

- `openai` -> `gpt-4o`
- `anthropic` -> `claude-3-5-sonnet-20241022`
- `huggingface` -> `MiniMaxAI/MiniMax-M2.7`
- `gemma` -> `gemma-4-31b-it`
- `deepseek` -> `deepseek-chat`
- `glm` -> `glm-5.1`
- `minimax` -> `MiniMax-M2.7`
- `ollama` -> no fixed hosted default

## Model Normalization

Model names are not used naively.

The runtime can normalize or alias model identifiers depending on provider. Examples:

- Hugging Face aliases normalize to canonical model IDs
- some Gemma aliases collapse to the currently supported default
- provider-aware heuristics detect whether a model string looks like OpenAI, Anthropic, DeepSeek, Gemma, GLM, MiniMax, Hugging Face, or an Ollama-style local model

## Runtime Availability and Fallback

The application persists a runtime availability state for models.

This means:

- a model can be temporarily marked unavailable
- the unavailability can expire after a TTL
- a fallback model can be chosen automatically

Examples of provider-specific fallback behavior include:

- DeepSeek `deepseek-reasoner` -> `deepseek-chat`
- GLM `glm-5.1` -> `glm-5`
- OpenAI higher-tier models -> smaller siblings
- Anthropic higher-tier models -> lower siblings
- MiniMax `-highspeed` -> non-highspeed equivalent

This makes provider/model selection dynamic rather than static.

## Parameter Resolution

Once provider and model are resolved, the app computes effective parameters by combining:

- stored admin-configured model parameters
- per-call overrides such as:
  - temperature
  - top-p
  - max tokens
  - response format

This is why two calls to the `same provider` may still behave differently depending on the control-plane configuration.

## Provider Gateway

Dispatch is registry-driven in the gateway.

The registry maps provider names to:

- chat adapter
- vision adapter

Important implication:

- not all providers support vision in this integration
- unsupported provider/vision combinations fail explicitly rather than silently degrading

## Response Shape

Business-facing provider calls are normalized back into an OpenAI-compatible response shape for callers.

That is important because:

- feature code does not need to deeply understand each provider response format
- routing can change while preserving a stable internal contract

## Error Normalization

Certain provider errors are classified as non-retryable, especially authentication/configuration failures.

Instead of surfacing raw provider text such as token/auth issues, the app normalizes them into a cleaner operational message indicating that the AI provider is misconfigured or its token expired.

This is both a UX and a security/sanitization behavior.

## Timeout Behavior

Provider calls inherit the application-level LLM timeout policy unless a longer explicit timeout is supplied.

In practice, the LLM layer is expected to obey the standardized timeout model already documented in the vault.

## Why This Matters

- Debugging an LLM issue requires looking at configuration resolution, not only the feature route.
- A feature may `call OpenAI` in concept while actually being redirected to another provider/model due to settings, aliases, availability state, or fallback rules.
- Provider issues, settings drift, and runtime availability state can all change behavior without any feature-code change.

## Practical Reading

When an AI behavior looks surprising, inspect in this order:

1. current canonical settings
2. configured provider and model
3. availability flags and runtime-unavailable state
4. effective parameter overrides
5. provider-specific adapter behavior
6. credit and timeout policy

## Related

- [[topics/LLM Control Plane]]
- [[topics/AI Credits]]
- [[topics/AI Timeouts]]
- [[topics/Integrations]]
- [[topics/Settings and Governance Surfaces]]

## Sources

- [[raw/sources/2026-04-16-llm-call-resolution]]
