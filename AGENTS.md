<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# trcodes — Enterprise Starter Boilerplate & Architecture Standard

Next.js 16.4.1 App Router enterprise boilerplate + role-management platform (Indonesian UI) using Prisma 7 / PostgreSQL, JWT session tracking, dynamic RBAC (features + action permissions), enterprise MFA (TOTP), strict nonce-based CSP, automated CLI scaffolding, and GEO (Generative Engine Optimization).

There is no `src/` directory despite any legacy comments; `@/*` maps directly to the repository root.

---

## ⚡ 5 Golden Rules for AI Agents (Read First!)

1. **Always Use CLI Scaffolding**: When tasked with creating a new dashboard feature, **never** write the 8 files manually from scratch. Always execute `npm run make:feature <key> "<Label>" [plural_slug]`.
2. **Strict Nonce CSP (NO INLINE STYLES)**: The production CSP strictly forbids `'unsafe-inline'`. **Never** use inline `style={{ ... }}` in JSX. Use Tailwind CSS classes or CSS variables.
3. **Centralized Form Styles**: Never write custom `border-slate-...` or `focus:ring-...` classes. Always import tokens from `@/common/utils/form-styles`: `inputCls`, `selectCls`, `textareaCls`, `numberInputCls`, `labelCls`, `errorCls`.
4. **Localized Image Uploads**: Never create generic upload actions or components in `common/`. Each module handling uploads must keep its own service logic (`save<Feature>Image`), server action, and UI field component inside `modules/dashboard/<feature>/`.
5. **Exact RBAC Action Naming**: Actions are strictly `"read" | "add" | "edit" | "delete"`. Use `can("feature_key", "add")`, **never** `"create"`. Always run `npm run lint && npx tsc --noEmit` before concluding any turn.

---

## 1. Commands & Quality Gates

Always verify code using the repo's real commands before marking any step complete:

- `npm install` — `postinstall` automatically triggers `prisma generate`.
- `npm run dev` — runs Next.js development server with Turbopack.
- `npm run build` — compiles production application (validates route segments & builds 40+ pages).
- `npm run start` — runs production server.
- `npm run lint` — ESLint only; no `typecheck` script in package.json.
- `npx tsc --noEmit` — mandatory TypeScript type checking.
- `npm run smoke` — automated Playwright E2E smoke test; runs against production build (`next start`), verifies public routes, auth redirects, Super Admin login, dashboard navigation, and mutations with automatic rollback. Set `SMOKE_BASE_URL` to test an existing instance.
- `npx prisma validate` — quick schema validation.
- `npx prisma generate` — regenerates Prisma client to `app/generated/prisma/client`.
- Database commands:
  - `npm run db:migrate -- --name <migration_name>` — creates and applies a new migration.
  - `npm run db:seed` — **destructive**: wipes all tables, reseeds core roles, features, permissions, and super admin from `prisma/seed.ts`.
  - `npm run db:studio` — opens Prisma Studio GUI.
  - `npm run db:reset` — wipes DB and reruns migrations + seed.

---

## 2. Core Architecture: Audience-Based Modular Design

### A. Routing Layer (`app/`)
- `app/` is **route-only**: it houses layouts, route pages, suspense boundaries, loading skeletons, route metadata, and dynamic web standards.
- **Never put business logic, complex data transformations, or direct DB queries in `app/`**.
- Route groups:
  - `app/(public)` — universal enterprise landing page (`/`) and secure authentication (`/login`, `/login/mfa`).
  - `app/(dashboard)` — authenticated administrative backoffice (`/dashboard`, `/dashboard/items`, `/dashboard/users`, etc.).
  - `app/api/` — GET-only JSON list endpoints used by client tables (`/api/items`, `/api/users`, etc.) guarded by `requirePermission`.
- Page components in `app/**/page.tsx` are thin async server wrappers around page components from `modules/public/*/pages/*` or `modules/dashboard/*/pages/*`.
- All DB-backed pages must export `export const instant = false;` and wrap content in `<Suspense fallback={<PublicPageSkeleton />}>` or `<Suspense fallback={<DashboardPageSkeleton />}>` to avoid dynamic prerendering errors and cache warnings.

### B. Common Layer (`common/`)
All cross-cutting, reusable resources live exclusively in `common/` (mapped via `@/common/*` and `@/*`):
- `common/components/` — shared design system UI (`Modal`, `Pagination`, `PageHeader`, `DataTable`, `SearchBox`, `skeletons/`, etc.).
- `common/constants/` — domain constants and magic numbers segregated by topic:
  - `rbac.constant.ts`: `ACTIONS`, `ACTION_COLUMN`, `ACTION_LABEL`, `ROLE_SUPER_ADMIN`, `ROLE_DEFAULT`, `PROTECTED_ROLE_NAMES`, `FEATURES`.
  - `auth.constant.ts`: Cookie names, session/MFA TTLs, lockout thresholds, rate limit ceilings.
  - `navigation.constant.ts`: `NAV_GROUPS` and navigation types.
  - `pagination.constant.ts`: `DEFAULT_PAGE_SIZE`, `PAGE_SIZE_OPTIONS`, `MAX_PAGE_SIZE`.
  - `app.constant.ts`: `APP_NAME`, `DEFAULT_SITE_TITLE`, `PUBLIC_PATHS`, `SEO_KEYWORDS`.
- `common/context/` — React Context providers (`PermissionContext`, `SidebarContext`).
- `common/hooks/` — shared client hooks (`use-list-params`).
- `common/lib/` — core server logic & database integrations (`auth`, `db`, `mfa`, `rate-limit`, `audit`).
- `common/types/` — ambient ambient definitions (`sweetalert2-esm.d.ts`).
- `common/utils/` — pure stateless utilities (`api`, `errors`, `form-styles`, `format-date-time`, `handle-action`, `rbac`, `request-ip`, `site`, `swal`, `totp`, `url`, `zod`).

### C. Modular Implementation (`modules/`)
Modules are strictly segregated by audience:

#### 1. Public Modules (`modules/public/<page>/`)
Organized per public domain: `home` (universal landing page, live system stats, feature showcase, architecture breakdown, quickstart guide) and `auth` (login & TOTP MFA challenge).
- `pages/*Page.tsx` — async server page component.
- `components/` — page-specific UI components.
- `*.queries.ts` — data queries (always `import "server-only"`).
- Cross-page public components live in `common/components/` (`PublicShell`, `PublicHeader`, `PublicFooter`).

#### 2. Dashboard Modules (`modules/dashboard/<feature>/`)
Every dashboard feature follows a uniform, predictable file shape:
- `*.schema.ts` — Zod schemas for input validation, form types, and table row contracts.
- `*.service.ts` — database mutations and business logic (always `import "server-only"`).
- `*.queries.ts` — database reads, list queries, pagination, and sorting (always `import "server-only"`).
- `*.actions.ts` — Next.js Server Actions (`"use server"`). Enforces `requirePermission` → `parseInput(schema)` → service call → `revalidatePath` → `handleAction`.
- `*.hooks.ts` — `"use client"` custom hooks integrating TanStack React Query.
- `components/` — `"use client"` table, filter bar, and form modal components.
- `pages/*Page.tsx` — async server page component invoking `requirePageAccess(FEATURE_NAME)` and rendering `<PageHeader />`.

---

## 3. UI/UX Design System & Component Guidelines

To ensure a cohesive, professional enterprise interface, all dashboard UI elements must strictly adhere to shared components and utility tokens.

### A. Centralized Form Styling (`common/utils/form-styles.ts`)
**NEVER write ad-hoc border, focus ring, or background classes on form inputs.** Always use:
- `inputCls` — standard single-line text, email, and password inputs.
- `selectCls` — dropdown selects.
- `textareaCls` — multi-line textareas.
- `numberInputCls` — numeric inputs.
- `checkboxCardCls` & `checkboxInputCls` — checkbox card containers and inputs.
- `labelCls` — standard uppercase micro-labels (`text-xs font-semibold text-slate-700`).
- `errorCls` — form validation error text.

### B. Enterprise Modal System (`common/components/Modal.tsx`)
All modal dialogs must use the unified `Modal` component:
- Props: `isOpen`, `onClose`, `title`, `subtitle`, `icon`, `size` (`sm` | `md` | `lg` | `xl` | `2xl`), and optional `footer`.
- Features: Glassmorphism backdrop (`bg-slate-950/65 backdrop-blur-md`), ambient ring, smooth zoom micro-animation, ESC key handling, autofocus lock, and header icon badge.

### C. Standardized Page Header (`common/components/PageHeader.tsx`)
All dashboard feature pages must use `<PageHeader />`:
- Props: `title`, `description` (or `desc`), optional `icon` (defaults to `Package`), optional `eyebrow` (defaults to `"Dashboard"`), optional `actions`.

### D. Standardized Pagination (`common/components/Pagination.tsx`)
All list tables must use the unified `Pagination` component:
- Props: `page`, `pageSize`, `total`, `onPageChange`, `onPageSizeChange`.
- Page size options: Dropdown selector featuring `10`, `25`, `50`, `100`, `'all'`, and a `'custom'` numeric input.
- Navigation: Compact, accessible icon-only Prev/Next buttons.

### E. CSS & Styling Gotchas (Tailwind CSS v4 & Strict Nonce CSP)
- Tailwind v4 has no `tailwind.config.js`; tokens and variables are declared in `app/globals.css`.
- **CRITICAL**: The production CSP strictly forbids `'unsafe-inline'` on scripts and styles.
  - **Never use inline `style={{ ... }}` attributes in JSX**.
  - Use Tailwind CSS classes (including arbitrary values like `text-[clamp(...)]`) or CSS custom properties managed via CSSOM.
- **Google Fonts (`next/font/google`)**: `Newsreader` must be instantiated once per style (`--font-newsreader` for normal, `--font-newsreader-italic` for italic). Combining styles in one instance breaks the Next 16 Turbopack production build.
- **SweetAlert2**: Default entry points inject inline styles. Always import from `sweetalert2/dist/sweetalert2.esm.js` via `common/utils/swal.ts` (CSS is imported globally in `app/layout.tsx`).

---

## 4. Database Layer & Prisma 7 Best Practices

- **Configuration**: Uses `prisma7.config.ts` (auto-loaded by Prisma 7 runner) reading `DATABASE_URL`.
- **Client Generation**: Generated to `app/generated/prisma` (gitignored). Import exclusively via `@/app/generated/prisma/client`.
- **IDs & Naming**:
  - Primary keys use `uuid(7)` (UUIDv7, time-sortable, optimal for B-tree database indexing).
  - Database table and column names use `snake_case`. TypeScript model properties use `camelCase`.
- **Repository Pattern**: When appropriate, decouple complex queries into dedicated repository classes (e.g., `lib/repositories/user.repository.ts`) to enable seamless mock testing and read-replica routing.

---

## 5. Security & Authentication Architecture

1. **Proxy & Nonce CSP (`proxy.ts`)**:
   - Next.js 16 replacement for `middleware.ts`.
   - Generates a per-request cryptographically secure nonce forwarded via `x-nonce` and CSP headers.
   - Guards authenticated routes (`/dashboard` redirects to `/login`, authenticated users on `/login` redirect to `/dashboard`).
   - Does **NOT** guard `/api/*`; API routes must enforce their own authentication via `requirePermission`.
2. **Session & Device Revocation**:
   - 12-hour HS256 JWT stored in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `session`.
   - The token contains a `sid` claim mapped directly to a row in `user_sessions`.
   - Users can view all active devices at `/dashboard/security` and revoke any session instantly.
   - Any password change, role modification, or MFA toggle increments `sessionVersion`, immediately invalidating all other active sessions across all devices.
3. **Multi-Factor Authentication (MFA / TOTP)**:
   - TOTP secrets are encrypted using **AES-256-GCM** with `MFA_ENCRYPTION_KEY` (or derived from `SESSION_SECRET`).
   - Recovery codes are stored as SHA-256 hashes and are strictly one-time use.
   - Super Admin MFA can be enforced globally via `ENFORCE_SUPER_ADMIN_MFA=true`.
4. **Distributed Rate Limiting**:
   - Backed by PostgreSQL table `rate_limit_buckets` using atomic `ON CONFLICT DO UPDATE` queries.
   - Automatically falls back to in-memory rate limiting if database connectivity fails.
   - Periodically prunes expired buckets.
5. **Audit Trails**:
   - All mutations must call `createAuditLog` from `@/common/lib/audit.ts`.
   - Table `audit_logs` is append-only and strictly read-only in the UI.
   - Never log passwords, tokens, or plaintext secrets in `detail`.
6. **URL & External Input Sanitization**:
   - Always validate external URLs using `@/common/utils/url.ts` (`isHttpUrl`, `isSafeLinkUrl`, `safeHref`, `safeHttpUrl`).

---

## 6. Permissions & RBAC Enforcement

- **Source of Truth**: `common/constants/rbac.constant.ts` declares all `FEATURES`, while `common/constants/navigation.constant.ts` declares `NAV_GROUPS`.
- Adding a new feature requires:
  1. Registering the feature key in `common/constants/rbac.constant.ts`.
  2. Adding navigation item to `NAV_GROUPS` in `common/constants/navigation.constant.ts`.
  3. Running `npm run db:sync` to sync features to the database and grant full permissions to Super Admin.
- **Layered Enforcement**:
  - Routing: `proxy.ts` (checks valid session).
  - Page level: `requirePageAccess("feature_key")` (redirects unauthorized users to `/forbidden`).
  - Action level: `requirePermission("feature_key", "action_name")` in server actions.
  - Client UI level: `const { can } = usePermission(); if (can("feature_key", "add")) { ... }`.

---

## 7. SEO & Generative Engine Optimization (GEO)

- **Dynamic Sitemap & Robots**: `app/sitemap.ts` dynamically queries all public routes and active projects; `app/robots.ts` allows public routes and disallows `/dashboard/`, `/api/`, and `/login`.
- **Dynamic OpenGraph**: `app/opengraph-image.tsx` generates branded social preview images using `@vercel/og`.
- **Structured Data (JSON-LD)**: Public pages inject schema markup (`Person`, `ProfilePage`, `TechArticle`, `BreadcrumbList`).
- **AI Search Readability**:
  - `public/llms.txt` and `public/llms-full.txt` provide concise markdown indexes for LLM web crawlers (ChatGPT Search, Perplexity, Gemini).
  - Raw markdown API: `/api/llm/content/[project]/[bab]` serves pure markdown content with token-efficient structure.

---

## 8. Automated Feature Scaffolding (For AI Agents & Developers)

When tasked with creating a new dashboard feature, **DO NOT create the 8 files manually from scratch**. Use the scaffolding generator:

```bash
npm run make:feature <feature_key> "<Feature Label>" [plural_slug]
# Example: npm run make:feature product "Katalog Produk" products
```

This immediately scaffolds the exact 8 standardized files matching all enterprise rules:
1. `modules/dashboard/<feature>/<feature>.schema.ts` (Zod validation & form types)
2. `modules/dashboard/<feature>/<feature>.service.ts` (Prisma mutations + audit log + server-only)
3. `modules/dashboard/<feature>/<feature>.queries.ts` (Prisma list queries + pagination + server-only)
4. `modules/dashboard/<feature>/<feature>.actions.ts` (Server Actions + requirePermission)
5. `modules/dashboard/<feature>/<feature>.hooks.ts` (React Query useMutation & useQuery)
6. `modules/dashboard/<feature>/components/<Feature>Modal.tsx` (Form modal with form-styles.ts & Modal.tsx)
7. `modules/dashboard/<feature>/components/<Feature>Table.tsx` (Table with Pagination.tsx & RBAC)
8. `modules/dashboard/<feature>/pages/<Feature>Page.tsx` (Server page with requirePageAccess)
9. `app/(dashboard)/dashboard/<plural_slug>/page.tsx` (Thin router wrapper with Suspense skeleton)

### Activation Steps After Scaffolding:
1. Add the corresponding model in `prisma/schema.prisma` with UUIDv7 primary key.
2. Run `npx prisma db push` or `npm run db:migrate -- --name add_<feature>`.
3. Register in constants:
   - Add to `common/constants/rbac.constant.ts` (`FEATURES` array): `{ key: "<feature_key>", name: "<Label>", desc: "Kelola data <Label>" }`.
   - Add to `common/constants/navigation.constant.ts` (`NAV_GROUPS`) under the appropriate menu group with a Lucide icon.
4. Run `npm run db:sync` to automatically sync the feature to database and grant full permissions to Super Admin.

---

## 9. Development & Coding Checklist

When implementing any feature, follow this checklist:

1. **Scaffold or Plan**: Use `npm run make:feature` or follow the 8-file modular shape.
2. **Data Layer**: Implement queries in `*.queries.ts` and mutations in `*.service.ts` with `import "server-only"`.
3. **Server Actions**: Implement `"use server"` actions in `*.actions.ts` guarded by `requirePermission`.
4. **Client Hooks & UI**: Create React Query hooks in `*.hooks.ts` and build table/modal components using `form-styles.ts`, `Modal.tsx`, and `Pagination.tsx`.
5. **Page Segment**: Create `pages/*Page.tsx` with `requirePageAccess` and thin wrapper in `app/(dashboard)/dashboard/<feature>/page.tsx`.
6. **Verify**:
   - `npm run lint` (0 error, 0 warning)
   - `npx tsc --noEmit` (0 error)
   - `npm run build` (all routes compile)

---

## 10. Autonomous Specification-Driven Development (`PROJECT_SPEC.md`)

When instructed to read `PROJECT_SPEC.md` and implement a new project or set of features:
1. **Project Metadata**: Parse branding parameters from Section 1 and update `package.json`, `common/constants/app.constant.ts`, and `docker-compose.yml`.
2. **Feature Scaffolding**: For each feature declared in Section 2, execute:
   ```bash
   npm run make:feature <key> "<Label>" [plural_slug] [--with-image]
   ```
3. **Field & Schema Customization**:
   - Customize Zod schemas & form types in `modules/dashboard/<key>/<key>.schema.ts`.
   - Update relations & field mapping in `prisma/schema.prisma`.
   - Implement form input components in `components/<Feature>Modal.tsx` and table columns in `components/<Feature>Table.tsx`.
4. **Database Migration & RBAC**:
   - Apply migration: `npm run db:migrate -- --name init_<project>`.
   - Sync permissions: `npm run db:sync`.
5. **Initial Seeder**: If sample records are specified in Section 3, append them to `prisma/seed.ts`.
6. **Strict Quality Gates**: Conclude by verifying `npx prisma validate && npm run lint && npx tsc --noEmit` with 0 errors.
