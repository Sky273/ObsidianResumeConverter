# Source Note: LLM call resolution according to configuration

## Purpose

Capture the actual runtime resolution path for LLM calls in ResumeConverter: how the configured provider/model influences which adapter is called and with which effective parameters.

## Files inspected

- `server/services/llmGateway.service.js`
- `server/services/llmProvider.service.js`
- `server/services/llmConfiguration.service.js`
- `server/services/settings.service.js`
- `server/services/llmAvailability.service.js`

## Durable facts

- Business LLM calls load current canonical LLM settings via `getLLMSettings()`.
- Settings are cached, but stale cached settings may still be used when DB fetch fails to keep the app operational.
- Runtime provider/model resolution is centralized:
  - provider from configured settings
  - model from requested model or configured model or provider default
  - model normalization is provider-aware
- Provider defaults are explicit, for example:
  - OpenAI -> `gpt-4o`
  - Anthropic -> `claude-3-5-sonnet-20241022`
  - Hugging Face -> `MiniMaxAI/MiniMax-M2.7`
  - Gemma -> `gemma-4-31b-it`
  - DeepSeek -> `deepseek-chat`
  - GLM -> `glm-5.1`
  - MiniMax -> `MiniMax-M2.7`
  - Ollama -> no fixed hosted default
- Some providers have model alias normalization or coercion:
  - Hugging Face aliases normalize to canonical model IDs
  - some Gemma model aliases collapse to the current supported default
- Runtime availability state is persisted and can temporarily mark models unavailable.
- Unavailable models can resolve to fallback models depending on provider rules.
- Provider fallback examples include:
  - DeepSeek `deepseek-reasoner` -> `deepseek-chat`
  - GLM `glm-5.1` -> `glm-5`
  - OpenAI higher tiers -> smaller siblings
  - Anthropic newer/higher tiers -> lower siblings
  - MiniMax `-highspeed` -> non-highspeed equivalent
- Effective model parameters are resolved after provider/model resolution, using admin-configured model parameters plus per-call overrides.
- The provider gateway is registry-driven and dispatches to provider-specific chat/vision adapters.
- Not every provider supports vision in this integration; unsupported provider/vision combinations fail explicitly.
- Business calls are normalized back to an OpenAI-compatible response shape for callers.
- Provider-auth/configuration errors are normalized into a non-retryable admin-facing configuration error instead of leaking raw provider messages.
- Timeout defaults are aligned with the global LLM operation timeout unless a longer explicit timeout is provided.

## Interpretation

- LLM calls in ResumeConverter are not direct “call provider X” operations.
- They are configuration-driven runtime resolutions with:
  - settings lookup
  - availability filtering
  - parameter resolution
  - provider dispatch
  - response normalization
  - provider-error sanitization
