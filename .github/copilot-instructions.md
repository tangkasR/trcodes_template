# GitHub Copilot Instructions for trcodes Enterprise Boilerplate

This repository follows the enterprise Next.js 16 App Router architecture documented comprehensively in `AGENTS.md`.

## Key Guardrails:
1. Architecture: Audience-based modular design (`modules/public/` vs `modules/dashboard/`). Reusable resources live exclusively in `common/` (`common/components/`, `common/constants/`, `common/lib/`, `common/utils/`).
2. Scaffolding: Always use `npm run make:feature <key> "<Label>" [plural_slug]` to scaffold dashboard features.
3. Strict Nonce CSP: Never output inline styles `style={{ ... }}` in JSX components.
4. Centralized Form Styles: Always use tokens from `@/common/utils/form-styles`.
5. Direct Imports: Always use 100% direct imports from `@/common/...`. No barrel index re-exports.
6. Validation & Quality: Verify every task with `npm run lint` and `npx tsc --noEmit`.
