# AI Operation Matrix

## Purpose

This page maps the business AI surfaces to:

- the charged `actionType`
- the traced business `operationType`
- the configurable cost setting and default cost
- the configurable max-token setting and default max-token budget

This matrix is intentionally operational rather than conceptual. It is meant to answer "which user-facing AI action consumes which credits, under which business label, with which token budget?"

## Matrix

| Surface | Main code path | Charged `actionType` | Business `operationType` | Cost setting | Default cost | Max tokens setting | Default max tokens | Notes |
| --- | --- | --- | --- | --- | ---: | --- | ---: | --- |
| Chatbot message | `server/routes/chatbot.routes.js` | `chatbot.message` | `Chatbot Message` | `aiCreditChatbotMessage` | 1 | `aiMaxTokensChatbotMessage` | 4000 | Uses workflow reservation + shared `callLLM` gateway. |
| Template extraction | `server/routes/templates/extraction/handlers.js` -> `server/services/templateExtraction.service.js` | `template.extract` | `Template Extraction` | `aiCreditTemplateExtract` | 15 | `aiMaxTokensTemplateExtract` | 32000 | Main HTML/layout-driven normalization path. |
| Template extraction vision fallback | `server/routes/templates/extraction/handlers.js` -> `server/services/templateExtraction.service.js` | `template.extract` | `Template Extraction Vision Fallback` | `aiCreditTemplateExtract` | 15 | `aiMaxTokensTemplateExtract` | 32000 | Same billed action as template extraction; different tracing label. |
| Resume AI modify | `server/routes/resumes/aiModify.handler.js` | `resume.ai_modify` | `Resume AI Modification` | `aiCreditResumeAiModify` | 5 | `aiMaxTokensResumeAiModify` | 8192 | Direct resume mutation assistance flow. |
| Resume initial analysis | `server/services/batchJobsWorker/itemProcessors.js` -> `server/services/batchJobsWorker/llmIntegration.js` -> `server/services/openai/resumeOperations.js` | `resume.analysis` | `Resume Analysis` | `aiCreditResumeAnalysis` | 25 | `aiMaxTokensResumeAnalysis` | 16000 | Charged during import/analyze flows. |
| Resume pre-analysis | `server/services/batchJobsWorker/itemProcessors.js` -> `preAnalyzeResumeWithLLM` -> `server/services/openai/resumeOperations.js` | `resume.analysis` | `Resume Pre-Analysis` | `aiCreditResumeAnalysis` | 25 | `aiMaxTokensResumeAnalysis` | 16000 | Uses the same analysis budget family when pre-analysis is enabled. |
| Improved resume post-analysis | `server/routes/resumes/crud/improvementHelpers.js` and `server/services/batchJobsWorker/processors/improvement.js` -> `analyzeImprovedResumeWithLLM` -> `server/services/openai/resumeOperations.js` | `resume.improvement` | `Improved Resume Analysis` | `aiCreditResumeImprovement` | 75 | `aiMaxTokensResumeImprovement` | 16384 | Persisted after an improvement generation; intentionally billed under improvement, not under base analysis. |
| Resume improvement generation | `server/routes/resumes/crud/improvementHelpers.js` and `server/services/batchJobsWorker/processors/improvement.js` -> `improveResumeWithLLM` -> `server/services/openai/resumeOperations.js` | `resume.improvement` | `Resume Improvement` | `aiCreditResumeImprovement` | 75 | `aiMaxTokensResumeImprovement` | 16384 | Same billed action as the post-improvement analysis pass. |
| Resume/mission match | `server/services/resumeAdaptation.service.js` and `server/services/batchJobsWorker/processors/profileAndMatching.js` -> `matchResumeWithMission` -> `server/services/openai/missionOperations.js` | `resume.match` | `Resume-Mission Matching` | `aiCreditResumeMatch` | 8 | `aiMaxTokensResumeMatch` | 4096 | Standalone matching flow without adaptation. |
| Resume adaptation | `server/services/resumeAdaptation.service.js` -> `adaptResumeToMission` -> `server/services/openai/missionOperations.js` | `resume.adaptation` | `Resume Adaptation` | `aiCreditResumeAdaptation` | 50 | `aiMaxTokensResumeAdaptation` | 8192 | The same billed action also covers the prerequisite match analysis inside the adaptation workflow. |
| Mission keyword extraction for profile search | `server/services/profileMatching.service.js` -> `server/services/profileMatching/missionKeywords.js` | `profile.search` | `Mission Keywords Extraction` | `aiCreditProfileSearch` | 12 | `aiMaxTokensProfileSearch` | 2048 | First LLM step in profile search. |
| Batch profile scoring | `server/services/profileMatching.service.js` -> `server/services/profileMatching/llmScoring.js` | `profile.search` | `Batch Profile Scoring` | `aiCreditProfileSearch` | 12 | `aiMaxTokensProfileSearch` | 2048 | Main ranking pass for candidate search. |
| Top-profile explanation pass | `server/services/profileMatching.service.js` -> `server/services/profileMatching/llmScoring.js` | `profile.search` | `Profile Match Explanation` | `aiCreditProfileSearch` | 12 | `aiMaxTokensProfileSearch` | 2048 | Optional second pass for richer explanations on the selected top profiles. |
| Detailed profile analysis | `server/services/profileMatching.service.js` -> `server/services/profileMatching/detailedAnalysis.js` | `profile.analysis` | `Detailed Profile Analysis` | `aiCreditProfileAnalysis` | 25 | `aiMaxTokensProfileAnalysis` | 3072 | Separate from broad profile search. |

## Key rules

- `actionType` is the charging and reservation key. It is the stable unit for credit governance.
- `operationType` is the business tracing label sent to the shared LLM layer. It is intentionally more granular than `actionType`.
- One `actionType` can legally cover multiple `operationType` values when several substeps are part of one priced user action.
- `template.extract` and `profile.search` are the clearest examples of one billed action spanning several traced LLM sub-operations.
- `resume.improvement` intentionally bundles both generation and the post-generation analysis used to persist the improved resume metadata.

## Findings from the 2026-04-16 audit

- Business AI paths routed through `callBusinessChatCompletion` were already carrying explicit `operationType` metadata.
- The remaining direct business `callLLM` gap was the chatbot route; it now sends:
  - `operationType: Chatbot Message`
  - `userMetadata.actionType: chatbot.message`
- Template extraction is now aligned as well:
  - billed under `template.extract`
  - traced as either `Template Extraction` or `Template Extraction Vision Fallback`

## Practical consequence

When adding a new AI feature, the implementation should define all four of these pieces together:

- `actionType`
- `operationType`
- configurable cost setting
- configurable max-token setting

If one of those is missing, the flow is only partially governed.

## Settings Surface Note

- The admin settings UI is expected to expose both the billed cost and the max-token budget for template extraction:
  - `aiCreditTemplateExtract`
  - `aiMaxTokensTemplateExtract`
- A 2026-04-16 fix restored the `aiMaxTokens*` canonical overlay in `/api/settings`. Before that fix, the runtime path for `template.extract` could already use the canonical max-token budget correctly while the settings screen still showed a stale/default `aiMaxTokensTemplateExtract` value.
