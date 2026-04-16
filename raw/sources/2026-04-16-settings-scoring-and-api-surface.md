# Source Note: settings fields, scoring, and API surface

## Scope

This note captures durable facts from the current codebase about:

- the most important settings fields
- the distinction between analysis scoring, local matching, and LLM match analysis
- the high-level API domain map

## Primary sources

- `client/src/pages/SettingsPage.utils.ts`
- `server/routes/settings.routes.js`
- `server/services/settings.service.js`
- `server/services/settings.helpers.js`
- `server/services/profileMatching/localRanking.js`
- `server/services/openai/missionOperations.js`
- `server/config/routeRegistry/apiRoutes.js`

## Settings field facts

- Settings cover provider/model selection, Ollama runtime details, prompt governance, weights, AI credit costs, AI max tokens, public-home behavior, registration governance, and DPO metadata.
- Defaults are defined in settings route helpers and frontend form defaults.
- Weight totals are normalized/validated rather than treated as arbitrary free-form values.
- `publicHomeEnabled`, `preAnalysisEnabled`, `chatbotEnabled`, and `cvMode` are all behaviorally important fields, not cosmetic preferences.

## Scoring facts

- Resume quality scoring uses weighted global rating logic.
- Local profile matching uses a separate configurable weighting model for skills, tools, industry, soft skills, title matching, and coverage multiplier.
- Mission fit uses dedicated LLM match analysis and contract validation.
- Adaptation workflows consume match-analysis output rather than bypassing it.

## API surface facts

- The main route registry is grouped around auth, settings, resumes, templates, firms, admin, adaptations, users, chatbot, market/reference data, clients/deals, consent/GDPR, sharing, pipeline, backup, batch jobs/exports, and optional billing.
- Thinking in route domains is more stable than thinking in individual route files.
