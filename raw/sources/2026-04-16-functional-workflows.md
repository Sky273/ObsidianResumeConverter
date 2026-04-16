# 2026-04-16 Functional Workflows

## Source Type

Direct codebase inspection.

## Files Inspected

- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\resumes.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\missions.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\batchJobs.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\pipeline.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\settings.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\chatbot.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\backup.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\share.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\billing.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\routes\metrics.routes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\resumeAdaptation.service.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\profileMatching.service.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\candidatePipeline.service.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\batchJobs.service.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\templateExtraction.service.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\client\src\pages\AdminWorkspacePage.tsx`
- `C:\Users\mail\CascadeProjects\ResumeConverter\client\src\pages\SettingsPage.tsx`

## Durable Facts

- ResumeConverter has both direct and asynchronous AI workflows.
- Batch jobs are a first-class subsystem, not an incidental background helper.
- Candidate pipeline and interview scheduling are core workflow extensions around resumes and missions.
- Settings expose LLM provider selection, prompts, scoring weights, AI credits, chatbot settings, GDPR, and API docs.
- Admin workspace centralizes users, firms, templates, email templates, tags, and firm credits.
- Sharing, backup, billing, and metrics are production features with dedicated routes and services.
