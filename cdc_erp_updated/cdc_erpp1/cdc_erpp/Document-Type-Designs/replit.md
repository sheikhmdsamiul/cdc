# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (port 8080)
│   ├── cdc-erp/            # React + Vite frontend ERP (port auto)
│   └── mockup-sandbox/     # Component preview server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

## CDC ERP System (`artifacts/cdc-erp`)

Full-stack ERP for Bangladesh's Department of Social Services (DSS) managing Child Development Centers (CDC).

### Features Implemented

**Authentication & RBAC**
- 11 roles: Super Admin, Head Office, DD Division, DD District, Center Admin, Superintendent, Probation Officer, **District Facilitator**, Case Worker, House Parent, Worker
- 4 centers seeded + Head Office; 20 users across all 3 centers (password: `Admin@1234`)
  - Global: superadmin, headoffice
  - Tongi: cw_tongi, df_tongi, po_tongi, supt_tongi, centeradmin_tongi, houseparent_tongi
  - Konabari: cw_konabari, df_konabari, po_konabari, supt_konabari, centeradmin_konabari, houseparent_konabari
  - Fulerhat: cw_fulerhat, df_fulerhat, po_fulerhat, supt_fulerhat, centeradmin_fulerhat, houseparent_fulerhat
- Session-based auth via `express-session` + `bcryptjs`; `requireAuth` middleware on all API routes

**Workflow Engine (5-step per PDF)**
- States: Draft → Submitted to DF → Reviewed by DF → Reviewed by PO → Approved/Rejected
- Send-back path: Superintendent → Sent Back to PO → (PO resubmits) → Reviewed by PO → Approved
- Actions: `submit_to_df` (CW), `review_by_df` (DF), `review_by_po` (PO), `resubmit` (PO), `final_approve` (Superintendent), `send_back` (Superintendent), `reject` (DF/PO/Superintendent), `reopen` (Superintendent/Admin)
- Role-permission matrix enforced server-side in `/api/workflow/cases/:id/action`
- Approved cases auto-close (`caseStatus = "Closed"`) and trigger print prompt
- Dashboard shows role-specific pending action alerts for each step

**13 DocTypes (modules)**
- Children profiles, Case Files (with workflow), Admissions, Health Assessments, Counseling Sessions, Guardians & Visits, Court Cases, Risk Assessments, Release Records, Follow-up Logs
- All modules: list page + create form + detail/[id] page

**Full CRUD with Role-Based Authorization — COMPLETE**
- `checkManageAccess()` helper in `auth.ts`: Super Admin always allowed; Center Admin allowed only for their center's records
- All 9 child-linked route files (admissions, counseling-sessions, health-assessments, court-cases, risk-assessments, guardians, guardian-visits, follow-ups, release-records) have POST/PUT/DELETE with center auth
- Cases route: PUT + DELETE with center auth; Police-acquisitions: DELETE added
- **Frontend (all 12 list pages)**: Pencil (edit) + Trash (delete) icon buttons in Actions column — visible only to Super Admin and Center Admin
  - Inline edit dialogs (pre-populated form, same as create) for: admissions, health, counseling, court-cases, risk-assessments, follow-ups, release-records, guardians (+ guardian visits)
  - Delete confirmation dialogs on all 12 pages
  - Navigate-to-detail for edit on: children, cases, police-requisitions, surveys
- `canManage = hasRole(user, "Super Admin", "Center Admin")` pattern on every list page

**Admin Pages** (Super Admin / Center Admin / Head Office only)
- User Management (`/admin/users`)
- Centers (`/admin/centers`)
- Org Structure / Admin Units (`/admin/org-structure`)

**Bilingual i18n (Bengali primary) — FULLY COMPLETE**
- `react-i18next` initialized in `src/i18n/index.ts`, imported in `main.tsx`
- Default language: Bengali (`bn`); persisted to `localStorage` key `cdc-lang`
- Comprehensive translation files: `src/i18n/locales/bn.ts` + `en.ts` covering all UI text
- Bengali fonts: Hind Siliguri + Noto Sans Bengali loaded from Google Fonts; NikoshBAN at `src/assets/fonts/NikoshBAN.ttf`
- `lang-bn` CSS class applied to `<html>` when Bengali is active; font overrides in `index.css`
- `LanguageSwitcher` component in Layout header (top bar) + Login page
- **All pages fully bilingual** (toggle works everywhere):
  - Login, Dashboard, Sidebar nav, all 13 DocType list pages
  - All detail pages: `admissions/[id]`, `health/[id]`, `court-cases/[id]`, `risk-assessments/[id]`, `counseling/[id]`, `guardians/[id]`, `release-records/[id]`, `follow-ups/[id]`, `children/[id]`
  - Case file page `cases/[id]`: WorkflowBar, IntakeTab (view+edit), RiskTab (view+edit), DetailTab (view+edit), PlanTab (view+edit), AgreementTab (view+edit), main CaseDetail header/tabs — all bilingual
  - Admin pages: `admin/users`, `admin/centers`, `admin/org-structure` — all bilingual
- Pattern: `const { i18n } = useTranslation(); const isBn = i18n.language === "bn";` then `isBn ? "বাংলা" : "English"` inline ternaries
- Module-level bilingual functions in `cases/[id].tsx`: `getTabs(isBn)`, `getLivingMap(isBn)`, `getProblemsMap(isBn)`, `getRiskDomains(isBn)`, `getRiskScoreLabels(isBn)`, `getChildDetailDomains(isBn)`

**Reports & Analytics**
- 9 report templates: Overview, Children Status, Monthly Admissions, Court Cases, Risk Assessments, Follow-ups, Release Records, Counseling Sessions, Center Comparison
- Left-sidebar nav; each report fetches its own API endpoint with Recharts charts
- Print-to-new-window with government-styled CSS (`usePrint` hook)
- Accessible via Sidebar → "বিশ্লেষণ" (Analytics) section → "প্রতিবেদন ও বিশ্লেষণ"

**API Routes** (base: `/api`)
- `/auth/login`, `/auth/logout`, `/auth/me`
- `/children`, `/cases`, `/admissions`, `/health-assessments`, `/counseling-sessions`
- `/guardians`, `/guardian-visits`, `/court-cases`, `/risk-assessments`, `/release-records`, `/follow-ups`
- `/workflow/cases/:id/action` (role-gated)
- `/users`, `/centers`, `/admin-units`, `/roles`
- `/dashboard/stats`, `/dashboard/activity`, `/dashboard/children-by-status`
- `/reports/overview`, `/reports/children-breakdown`, `/reports/admissions-monthly`, `/reports/court-cases`, `/reports/risk-assessments`, `/reports/follow-ups`, `/reports/releases`, `/reports/counseling`, `/reports/center-comparison`
