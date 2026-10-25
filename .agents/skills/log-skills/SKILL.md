---
name: log-skills
description: Maintain this repository's build progress log and resume work step by step according to trcodes enterprise architecture conventions. Keeps a local PROGRESS.md up to date and verifies each step with the repo's real commands.
---

# Progress Logging and Step-by-Step Delivery Guide

Use this skill whenever work should be planned, recorded, resumed, or broken into small, verifiable steps. It ensures any developer or AI agent can immediately pick up where work left off and implement new features matching the exact coding concepts and standards established in this codebase.

> **Note on Version Control**: `PROGRESS.md` is ignored by Git in `.gitignore` so that local development logs do not pollute public commits. However, this skill and `AGENTS.md` are tracked in Git so any AI agent cloning the repository can immediately follow these conventions.

---

## 1. When to Apply

- "log progress", "update progress", "catat progress", "dimana kita berhenti"
- "continue", "lanjut", "resume", "next step", "buat fitur baru"
- Starting or continuing a multi-step feature, fix, refactor, or UI improvement
- Finishing a task and recording verified commands
- Any session expected to be handed off to another agent or developer

---

## 2. Read Before Writing (Context Recovery)

Read these in order at the start of every invocation:

1. `PROGRESS.md` (local file) — current focus, active tasks, blockers, and decisions. Create it if missing.
2. `AGENTS.md` — enterprise architecture, commands, security rules, and UI/UX conventions.
3. `git status -s` — inspect modified and untracked files before touching code.
4. Only the files relevant to the active step.

Trust actual code and terminal command output over assumptions. If `PROGRESS.md` and the codebase disagree, inspect the code and update the log.

---

## 3. Standard Feature Implementation Workflow

When building any new feature, follow this modular recipe strictly:

### A. Dashboard Feature (`modules/dashboard/<feature>/`)
Every dashboard feature must mirror this exact structure:
1. **Schema (`<feature>.schema.ts`)**: Define Zod validation schemas for create/update inputs and TypeScript row/form contracts.
2. **Service (`<feature>.service.ts`)**: Implement database mutations with `import "server-only"`. Include audit logs via `createAuditLog` from `@/common/lib/audit`.
3. **Queries (`<feature>.queries.ts`)**: Implement database reads, list queries, pagination, and sorting with `import "server-only"`.
4. **Actions (`<feature>.actions.ts`)**: Export `"use server"` Next.js Server Actions:
   - Call `await requirePermission("<feature_key>", "<action_name>")`
   - Parse input with Zod
   - Call service
   - Call `revalidatePath`
   - Return standardized response using `handleAction` from `@/common/utils/handle-action`
5. **Client Hooks (`<feature>.hooks.ts`)**: Export `"use client"` custom hooks integrating TanStack React Query (`useQuery`, `useMutation`).
6. **Components (`components/`)**:
   - Form modal using `@/common/components/Modal`.
   - All inputs/selects/textareas MUST use utility tokens from `@/common/utils/form-styles` (`inputCls`, `selectCls`, `textareaCls`, `numberInputCls`, `labelCls`, `errorCls`).
   - Tables with `@/common/components/Pagination` (preset limits 10, 25, 50, 100, 'all', and custom numeric limit).
7. **Page Component (`pages/<Feature>Page.tsx`)**: Async server component checking `await requirePageAccess("<feature_key>")`.
8. **Route Segment (`app/(dashboard)/dashboard/<feature>/page.tsx`)**: Thin wrapper exporting `export const instant = false;` and rendering `<Suspense fallback={<DashboardPageSkeleton />}>`.
9. **RBAC Registration**: Register the feature in `@/common/constants/rbac.constant.ts` (`FEATURES`) and `@/common/constants/navigation.constant.ts` (`NAV_GROUPS`), then run `npm run db:sync`.

### B. Public Feature (`modules/public/<page>/`)
1. Organized per page domain under `modules/public/<page>/`.
2. Data loaded via `*.queries.ts` (`import "server-only"`).
3. Renders `PublicShell` from `@/common/components/PublicShell`.
4. Uses Google Newsreader fonts (`--font-newsreader`, `--font-newsreader-italic` as separate instances) and Tailwind CSS v4 variables in `app/globals.css`.
5. Dynamic route metadata with `generateMetadata` and Schema.org JSON-LD structured data.

---

## 4. Execution & Verification Protocol

Never declare a task complete or update `PROGRESS.md` to `done` without running the relevant verification gates:

- **Lint & Types**:
  - `npm run lint` — ESLint rules must pass with 0 errors.
  - `npx tsc --noEmit` — strict TypeScript compilation check.
- **Database Changes**:
  - `npx prisma validate` — validate schema syntax in `prisma/schema.prisma`.
  - `npm run db:migrate -- --name <name>` — apply migration.
  - `npx prisma generate` — regenerate client to `app/generated/prisma/client`.
- **Build & Integration**:
  - `npm run build` — compiles all App Router segments and checks dynamic rendering boundaries.
  - `npm run smoke` — Playwright automated E2E test verifying public pages, auth guards, Super Admin login, and dashboard mutations.

---

## 5. `PROGRESS.md` Template

Use this markdown structure when maintaining `PROGRESS.md`:

```markdown
# trcodes — Build Progress

Updated: YYYY-MM-DD HH:mm (Asia/Jakarta)
Current focus: <one sentence summary>

## Now

- [ ] <the single active task>
- Status: in-progress | blocked | done
- Touching: `path/to/file`, `path/to/file`

## Next step

1. <the next concrete action, small enough for one turn>
2. Verification: `<command>`

## Milestones

- [x] Base Next.js app, Prisma 7 + PostgreSQL, auth session
- [x] RBAC (features, roles, permissions) and dashboard shell
- [x] Unified Form & Modal Design System (form-styles.ts, Modal.tsx, Pagination.tsx)
- [x] Security Hardening (Nonce CSP, MFA TOTP AES-256-GCM, Session Revocation)
- [x] SEO 100/100 & GEO (llms.txt, JSON-LD, Dynamic OG & Sitemap)
- [ ] <current milestone>
- [ ] <future milestone>

## Log

### YYYY-MM-DD HH:mm — <short title>

Status: done
Files:
- `modules/dashboard/example/example.service.ts`
- `modules/dashboard/example/components/ExampleModal.tsx`

Verification:
- `npm run lint` — pass (0 errors)
- `npx tsc --noEmit` — pass (0 errors)
- `npm run build` — pass (40/40 routes compiled)
- `npm run smoke` — pass (Playwright assertions 100%)

Notes:
- <architectural decision, trade-off, or caveat>

Next:
- <what the next session should do>

## Backlog

- [ ] <task> — priority: high | medium | low
- [ ] <task> — depends on: <other task>

## Blockers / Decisions

- <date>: chose <approach> because <reason>; rejected <alternative> because <reason>
```

---

## 6. Repository Guardrails

- **No `src/` directory**: `@/*` maps directly to root.
- **No inline styles**: Strict Nonce CSP blocks inline `style=""` in production. Always use Tailwind CSS classes or CSS variables.
- **Centralized Form Styles**: Never write custom `border-slate-...` or `focus:ring-...` on inputs. Always use tokens from `@/common/utils/form-styles.ts`.
- **Prisma Client**: Client generated at `app/generated/prisma/client`. Never edit generated files directly.
- **Language**: Indonesian for all user-facing UI labels, validation messages, and alerts.
- **Security**: Never expose secrets or passwords in `audit_logs` or log files.
