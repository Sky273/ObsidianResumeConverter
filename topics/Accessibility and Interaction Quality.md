# Accessibility and Interaction Quality

## Summary

ResumeConverter has partial accessibility foundations but not yet a full accessibility program. The most durable current improvements are:

- a keyboard-visible skip link and a stable main-content target in the app shell
- better dialog semantics on custom modal surfaces
- reader-friendly live status semantics on long-running CV improvement overlays
- automated lint and test guardrails on critical auth surfaces
- explicit field-level error semantics on sign-in, registration, and reset-password flows

## Current State

- Global focus-visible styles already exist in `client/src/styles/_base.css`.
- The app shell now exposes a skip link to `#main-content` and a focusable main landmark through `client/src/components/Layout.tsx`.
- The custom `UsersManagement` modal now uses `aria-labelledby` / `aria-describedby`, restores focus, and closes on `Escape`.
- The CV improvement overlay now exposes a live status region and, in fullscreen mode, a dialog wrapper with a labelled description path.
- The chatbot window now has dialog semantics and explicit label wiring for its message input.
- The frontend lint stack now includes `eslint-plugin-jsx-a11y`, with the plugin-wide `label-has-associated-control` rule explicitly disabled because it crashes in this repository's current dependency mix (`minimatch` interop issue) and would otherwise make the guardrail unusable.
- Critical auth forms now expose `role="alert"` summaries, `aria-invalid`, and `aria-describedby` paths:
  - `client/src/components/SignIn.tsx`
  - `client/src/components/Register.tsx`
  - `client/src/pages/ResetPasswordPage.tsx`
- Targeted `axe` smoke coverage now exists on:
  - `client/src/components/SignIn.test.tsx`
  - `client/src/components/Register.test.tsx`
  - `client/src/pages/ResetPasswordPage.test.tsx`
- The editorial CVthèque and Missions pages now use the same visual language for the page-primary CTA and the active view toggle:
  - the reusable CTA class is aligned to `segmented-control__item--active`
  - this keeps one dominant action per page without introducing a competing button style
- The same CTA hierarchy is now extended to other top-level action surfaces:
  - editorial matching search uses the editorial CTA class `cv-page-primary-action`
  - auth entry flows use a global primary CTA class `app-primary-action`
  - this keeps the main submit/search action visually dominant across page types without mixing multiple unrelated "primary" styles
- The home page and reusable tab system now converge more cleanly:
  - `ResponsivePageTabs` accepts optional icons, so page sections can reuse the shared tab component without inventing a separate navigation widget
  - the authenticated home sticky navigation now reuses `ResponsivePageTabs` instead of a home-specific active-pill implementation
- The global CTA migration is no longer limited to auth:
  - legacy blue primaries based on `btn btn-primary` or explicit `bg-indigo-600` button styling are being normalized onto `app-primary-action`
  - editorial pages still keep their scoped CTA recipe through `cv-page-primary-action`
- Runtime boolean controls are now standardized on a shared switch component:
  - `client/src/components/ui/Switch.tsx` renders `role="switch"` with `aria-checked`
  - Settings imports remain compatible through `client/src/components/SettingsPage/SettingsSwitch.tsx`
  - `client/src/components/SwitchMigration.test.ts` guards against reintroducing native `type="checkbox"` inputs in runtime source

## Important Facts

- Accessibility coverage is still uneven across the product.
- Headless UI-backed surfaces such as `AboutModal` are safer than custom overlays, but custom UI still exists in several places.
- Long-running workflows are a key accessibility surface because much of the product depends on async AI and batch-job states.
- Form accessibility is still uneven outside the auth perimeter; the auth flows are now the most explicit pattern to reuse.
- Visual hierarchy matters for interaction quality: on dense editorial pages, introducing multiple primary-looking button styles weakens the action hierarchy and increases scanning cost.

## Remaining Priorities

1. Standardize custom dialogs and drawers:
   - focus trap
   - focus restoration
   - `aria-labelledby` / `aria-describedby`
   - consistent keyboard close behavior
2. Extend field-level form semantics outside auth:
   - `aria-invalid`
   - `aria-describedby`
   - first-invalid focus
   - error summaries
3. Improve async status semantics across the rest of the app:
   - `aria-live`
   - `aria-busy`
   - stable textual progress announcements
4. Do a dedicated contrast and icon-only control pass.

## Related

- [[topics/Application Surface]]
- [[topics/Observability and Quality]]
- [[topics/Product Scope and Priorities]]

## Sources

- `client/src/components/Layout.tsx`
- `client/src/components/UsersManagement/Modal.tsx`
- `client/src/components/ImprovementAnimation.tsx`
- `client/src/components/chatbot/ChatbotWindow.tsx`
- `client/src/components/SignIn.tsx`
- `client/src/components/Register.tsx`
- `client/src/pages/ResetPasswordPage.tsx`
- `client/src/components/page/ViewModeToggle.tsx`
- `client/src/components/ResumesPage/SearchAndActions.tsx`
- `client/src/components/MissionsPage/MissionsDealsGroupedView.parts.tsx`
- `client/src/pages/ProfileMatchSearchPanel.tsx`
- `client/src/components/SignIn.tsx`
- `client/src/components/Register.tsx`
- `client/src/pages/ForgotPasswordPage.tsx`
- `client/src/components/HomePage/HomeStickyNav.tsx`
- `client/src/components/page/ResponsivePageTabs.tsx`
- `client/src/components/HomeDashboard.sections.tsx`
- `client/src/components/HomeDashboard.utils.ts`
- `client/src/components/HomeDashboard.types.ts`
- `client/src/components/ui/Switch.tsx`
- `client/src/components/SettingsPage/SettingsSwitch.tsx`
- `client/src/components/SwitchMigration.test.ts`
- `client/src/styles/editorialPages.css`
- `client/src/styles/resumesEditorial.css`
- `client/src/styles/_base.css`
- `client/src/components/HomePage/HomeHeroSection.tsx`
- `client/src/components/SignIn.test.tsx`
- `client/src/components/Register.test.tsx`
- `client/src/pages/ResetPasswordPage.test.tsx`
- `eslint.config.js`
- `client/src/styles/_base.css`
