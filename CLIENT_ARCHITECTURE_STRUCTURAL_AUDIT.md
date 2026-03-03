# Client Architecture & Structural Integrity Audit

Scope:
- `apps/web`
- `packages/ui`

Date: 2026-03-04

---

## Executive Summary

The client architecture is feature-complete and modular at repository level, but maintainability is reduced by boundary drift in `apps/web`: duplicated UI primitives/hooks, mixed data-orchestration inside large components, inconsistent API/environment contracts, and weak type/validation consistency in selected flows. `packages/ui` remains cleanly decoupled from backend concerns and is a strong foundation.

Primary priority order:
1. Boundary cleanup and centralization (UI, hooks, env, API client patterns)
2. Contract/type hardening
3. Decomposition of oversized components
4. Test and governance guardrails

---

## Strengths

- Workspace-level separation is good (`apps/web` vs `packages/ui`).
- Query abstractions exist under `apps/web/lib/queries/*` and cover core domains.
- Route-grouped layouts and per-segment error/loading boundaries are present.
- `packages/ui` is presentation-only and does not directly couple to API/network code.

---

## Findings

| Severity | Category | Evidence | Why this hurts maintainability | Recommended remediation |
|---|---|---|---|---|
| High | UI boundary duplication | `apps/web/components/ui/background-beams.tsx` and `packages/ui/src/components/background-beams.tsx` | Same component concept in two ownership zones creates drift and inconsistent fixes. | Keep one canonical implementation in `packages/ui`; remove local duplicate and update imports. |
| Medium | Unused/parallel local UI layer | Files under `apps/web/components/ui/*` (e.g. `pagination.tsx`, `empty-state.tsx`) alongside package primitives | Parallel local primitives blur architecture and leave stale code paths. | Delete unused local primitives; migrate legitimate variants into shared package with explicit ownership. |
| High | Hook duplication | `apps/web/hooks/use-mobile.ts` vs `packages/ui/src/hooks/use-mobile.ts` | Two implementations for same concern split bugfixes and behavior consistency. | Remove app copy; consume package hook from shared layer only. |
| High | Data + UI mixed in same components | `apps/web/components/account-settings/api-section.tsx`; `data-privacy-section.tsx` | Components handle API orchestration, transformation, and rendering together, reducing reuse/testability. | Move data logic to domain hooks/services (`lib/queries/account.ts` etc.) and keep components presentational. |
| High | Oversized mixed-responsibility components | `apps/web/app/(standalone)/testimonials/[slug]/page.tsx` (~537 LOC); `apps/web/components/widgets/widget-preview.tsx` (~617 LOC) | Large files increase cognitive load and change risk; side effects are hard to isolate. | Split into domain hooks + utilities + focused view components; cap orchestration components to smaller units. |
| High | Layer inversion | `apps/web/lib/query-client.ts` imports from `apps/web/components/billing/upgrade-modal.tsx` | Infrastructure layer depending on component module violates layering and increases coupling. | Extract modal store into neutral state module (`apps/web/store/*`) and import from both layers. |
| High | Contract drift (widget models) | `apps/web/types/api.ts` and `packages/types/src/widget.ts`, consumed via `apps/web/lib/queries/widgets.ts` | Conflicting model shapes (`config` vs alternative fields) make refactors fragile. | Consolidate to shared `@workspace/types` widget contracts; deprecate local duplicate model. |
| Medium | Type-safety erosion via `any` | `apps/web/components/account-settings/general-settings-section.tsx`; `profile-information-section.tsx`; `lib/queries/privacy.ts`; `lib/queries/notifications.ts` | `any` suppresses compile-time detection of contract changes. | Replace with concrete DTOs; enforce stricter lint rule in domain/query layers. |
| Medium | Inconsistent error handling | `hooks/use-subscription.ts` swallows errors; query files toast; components log manually | Behavior varies unpredictably across features and makes diagnostics inconsistent. | Define one error strategy: normalize at data layer, present at UI layer with consistent format. |
| Medium | Fragmented env/base URL access | `hooks/use-api.ts`; `lib/embed-code.ts`; `components/widgets/embed-code-dialog.tsx`; standalone testimonials page | Repeated env handling and localhost literals create divergence between environments. | Create typed `config/env.ts` with single base-url accessor and remove literal fallbacks from feature code. |
| Medium | Route-policy mismatch risk | `apps/web/middleware.ts` public matcher `/testimonial(.*)` while route is `/testimonials/[slug]` | Policy/config drift can cause future auth behavior bugs. | Align matcher patterns to concrete route map and add middleware policy tests. |
| Medium | Query API contract mismatch | `apps/web/lib/queries/notifications.ts` accepts `isAblyConnected` but does not use it (`refetchInterval: false`) | Misleading API surfaces cause misuse and stale assumptions. | Implement intended behavior or remove parameter/comment. |
| High | Package boundary bypass | `apps/web/tsconfig.json` maps `@workspace/ui/*` directly to `../../packages/ui/src/*` | App can consume package internals directly, bypassing public package contract. | Restrict to package exports only; remove src alias and enforce with lint import rules. |
| High | Testability gap | No meaningful `apps/web` / `packages/ui` tests found in scope | Critical workflows and architecture rules have no regression safety net. | Add route-policy, query-contract, and critical interaction tests first; then broaden incrementally. |

---

## Root Fix Proposals (Reviewed & Refined)

This section proposes **root-level** fixes for each finding (not superficial patches), then applies a self-review to remove new anti-patterns.

### 1) UI boundary duplication (`background-beams`)

**Root fix**
- Keep `packages/ui/src/components/background-beams.tsx` as single source.
- Replace all imports of `apps/web/components/ui/background-beams.tsx` with package export.
- Delete `apps/web/components/ui/background-beams.tsx`.
- Add lint guard in `apps/web` to block local component names that duplicate package primitives.

**Acceptance checks**
- No references remain to `apps/web/components/ui/background-beams.tsx`.
- Package component visual parity confirmed on all current call sites.

---

### 2) Unused/parallel local UI layer (`apps/web/components/ui/*`)

**Root fix**
- Run usage-driven cleanup of each file under `apps/web/components/ui/*`.
- For each file: either (a) remove if unused, or (b) move into `packages/ui` if truly reusable.
- Publish explicit ownership rule: app-level UI files may exist only when domain-specific and non-reusable.

**Acceptance checks**
- Every remaining local UI file has at least one usage and a short domain-specific rationale.
- Shared primitives are imported only from `@workspace/ui`.

---

### 3) Hook duplication (`use-mobile`)

**Root fix**
- Canonicalize on `packages/ui/src/hooks/use-mobile.ts`.
- Remove `apps/web/hooks/use-mobile.ts`.
- If app needs variant behavior, add options to shared hook rather than creating a fork.

**Acceptance checks**
- Single implementation exists.
- No functional regressions in sidebar/responsive behavior.

---

### 4) Data + UI mixed in account components

**Root fix**
- Create domain hooks in `apps/web/lib/queries/account.ts` (or `hooks/account/*`) for:
	- API key list/create/revoke
	- account export aggregation
- Keep `components/account-settings/*` view-only: props + callbacks + local UI state.
- Move payload mapping/normalization into hook/service layer.

**Acceptance checks**
- `api-section.tsx` and `data-privacy-section.tsx` contain no raw fetch/axios orchestration.
- Components are testable with mocked hook return values.

---

### 5) Oversized mixed-responsibility components

**Root fix**
- Split `app/(standalone)/testimonials/[slug]/page.tsx` into:
	- route shell
	- `useTestimonialSubmissionFlow` hook
	- form schema + payload mapper
	- API adapter module
- Split `components/widgets/widget-preview.tsx` into:
	- preview transport adapter
	- iframe/message bridge
	- rendering controls
	- pure UI segments

**Acceptance checks**
- No single orchestrator file > ~250 LOC.
- Side effects isolated in hooks/adapters, not mixed throughout JSX tree.

---

### 6) Layer inversion (`query-client` importing UI module)

**Root fix**
- Move upgrade modal store to `apps/web/store/upgrade-modal-store.ts`.
- Make both `lib/query-client.ts` and `components/billing/upgrade-modal.tsx` depend on store module.
- Keep query client UI-agnostic; if possible emit typed events instead of directly toggling modal state.

**Acceptance checks**
- `lib/query-client.ts` imports no component modules.
- Dependency direction is infra → store contracts, UI → store contracts.

---

### 7) Widget contract drift (`apps/web/types/api.ts` vs `packages/types`)

**Root fix**
- Treat `packages/types` as authoritative for widget DTOs.
- Deprecate/remove widget model duplicates from `apps/web/types/api.ts`.
- Add translation adapters only if backend response differs from shared DTO (single place, explicit mapping).

**Acceptance checks**
- Widget query/mutation signatures use `@workspace/types` only.
- No conflicting `Widget*` interfaces in app-local type files.

---

### 8) `any` type erosion

**Root fix**
- Replace `any` with explicit DTO interfaces in affected files.
- Add lint policy: `no-explicit-any` for `apps/web/lib/**`, `apps/web/hooks/**`, `apps/web/components/account-settings/**`.
- Use narrow unknown-to-typed parsing at boundaries (API response normalizers).

**Acceptance checks**
- Targeted directories compile with zero `any`.
- New API fields trigger type errors instead of silent runtime drift.

---

### 9) Inconsistent error handling

**Root fix**
- Introduce shared error normalizer in `apps/web/lib/errors/http-error.ts`.
- Standardize rule:
	- data layer returns normalized error objects
	- UI layer decides user messaging (toast, inline, modal)
- Remove side-effect toasts from deep query internals where possible.

**Acceptance checks**
- One normalized error shape consumed across queries/components.
- No mixed patterns of silent swallow + console spam + ad-hoc toast chains.

---

### 10) Fragmented env/base URL usage

**Root fix**
- Add `apps/web/config/env.ts` with typed accessors:
	- `getApiBaseUrl()`
	- `getPublicApiBaseUrl()` (if distinct)
- Replace direct `process.env.NEXT_PUBLIC_API_URL` and localhost literals in feature code.
- Keep fallback policy centralized (one place).

**Acceptance checks**
- Feature files do not reference raw API env vars directly.
- Base URL behavior is deterministic and environment-safe.

---

### 11) Middleware route-policy mismatch

**Root fix**
- Align middleware matcher strings with route map (`/testimonials/*` consistency).
- Add route-policy tests for representative public/protected paths.
- Maintain a route policy manifest (`apps/web/config/route-policy.ts`) consumed by middleware.

**Acceptance checks**
- Matcher set and app routes are in sync.
- CI fails on policy drift.

---

### 12) Query API contract mismatch (`isAblyConnected` unused)

**Root fix**
- Choose one:
	- implement conditional polling based on connection status, or
	- remove argument and comments completely.
- Keep function signatures truthful to behavior.

**Acceptance checks**
- Zero unused behavioral parameters in query APIs.
- Docs/comments match implementation.

---

### 13) Package boundary bypass (`@workspace/ui/*` -> `src/*`)

**Root fix**
- Remove direct source alias mapping from `apps/web/tsconfig.json`.
- Consume package public exports only.
- Enforce with ESLint import restriction to block `@workspace/ui/src/*` patterns.

**Acceptance checks**
- App compiles without direct source imports.
- Package boundaries are enforced in CI.

---

### 14) Testability gap

**Root fix**
- Add minimum safety suite:
	1. middleware route-policy tests
	2. query contract tests for core modules (`projects`, `widgets`, `notifications`, `privacy`)
	3. interaction tests for high-risk flows (public testimonial submission, API key management, widget preview)
- Add coverage gate for changed files (diff-based threshold).

**Acceptance checks**
- Core regression suite runs in CI.
- Architectural drift (routes/contracts) is caught pre-merge.

---

## Self-Review & Refinement (Anti-Pattern Check)

Reviewed proposed fixes against common anti-patterns and refined as follows:

1. **Avoided “god module” anti-pattern**
- Did not propose a single mega-service.
- Kept domain split (`account`, `widgets`, `notifications`, etc.).

2. **Avoided over-centralizing UI behavior in infra**
- Query client fix uses neutral store/event boundary, not direct component control.

3. **Avoided shallow delete-only cleanup**
- Duplication cleanup requires ownership rules + lint guards, not one-time deletions.

4. **Avoided “types only” false confidence**
- Contract fix includes adapter boundary + test validation, not just interface renaming.

5. **Avoided hidden runtime config drift**
- Env fix centralizes both accessor and fallback policy in one module.

6. **Avoided test sprawl without impact**
- Test plan starts with risk hotspots and policy/contract checks first.

7. **Avoided broad rewrites**
- Proposals are incremental and can be delivered in PR-sized slices.

---

## Anti-Pattern Summary

- Atomic/component boundaries: shared UI exists but app-local duplicates undermine ownership clarity.
- Data-vs-view separation: several organism-level components own network/business orchestration.
- Contract and typing discipline: mixed local/shared models and `any` usage reduce safety.
- Cross-layer coupling: infra touches component modules.
- Consistency drift: middleware patterns, endpoint usage assumptions, and env handling are not unified.
- Governance gap: no strong test/lint guardrails to prevent recurrence.

---

## Prioritized Remediation Roadmap

## Quick wins (1–2 sprints)

1. Remove duplicate hooks/components (`use-mobile`, duplicated UI primitives).
2. Align middleware matcher with actual route naming.
3. Fix misleading query API surfaces (`notifications` polling param/comment mismatch).
4. Extract upgrade modal store from component file into neutral state module.
5. Introduce centralized env helper for API base URL.

## Medium-term (3–6 sprints)

1. Refactor account-settings data orchestration into query/service hooks.
2. Unify widget and related API contracts around `@workspace/types`.
3. Remove direct `@workspace/ui/src` alias consumption and enforce package boundary rules.
4. Standardize network error normalization and response handling patterns.

## Long-term (6+ sprints)

1. Decompose oversized pages/components into domain-layer modules.
2. Add architecture governance checks (import boundaries, strict no-`any` in domain layer).
3. Build durable test pyramid for web/ui (route policy, query contracts, key interaction journeys).

---

## Conclusion

`packages/ui` is in good architectural shape as a reusable presentation layer. Most structural debt is concentrated in `apps/web`, particularly at boundaries between UI, data orchestration, and shared contracts. Addressing the high-severity boundary and contract issues first will produce immediate maintainability gains and lower long-term audit risk.
