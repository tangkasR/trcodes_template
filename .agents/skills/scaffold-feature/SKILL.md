---
name: scaffold-feature
description: Guide AI agents to scaffold, register, and activate new enterprise dashboard features in trcodes using the standard CLI generator and modular architecture.
---

# Feature Scaffolding Workflow Guide

Use this skill whenever asked to create, scaffold, or add a new dashboard feature (e.g., "buatkan fitur produk", "tambah master supplier", "create category module").

## 1. Feature Naming Convention
- **Feature Key** (`<key>`): Singular, lowercase, kebab-case (e.g., `product`, `category`, `supplier`).
- **Feature Label** (`"<Label>"`): Indonesian human-readable title (e.g., `"Katalog Produk"`, `"Kategori Berita"`).
- **Plural Slug** (`[plural_slug]`): URL segment in dashboard (e.g., `products`, `categories`). Defaults to `<key>s`.

## 2. Standard Scaffolding Execution
Always run the CLI generator instead of creating files manually:

```bash
npm run make:feature <key> "<Label>" [plural_slug]
```

This generates 9 standardized files:
1. `modules/dashboard/<key>/<key>.schema.ts` (Zod validation & form types)
2. `modules/dashboard/<key>/<key>.service.ts` (Prisma mutations + audit log + server-only)
3. `modules/dashboard/<key>/<key>.queries.ts` (Prisma list queries + pagination + server-only)
4. `modules/dashboard/<key>/<key>.actions.ts` (Next.js Server Actions + requirePermission)
5. `modules/dashboard/<key>/<key>.hooks.ts` (TanStack React Query hooks)
6. `modules/dashboard/<key>/components/<Pascal>Modal.tsx` (Form modal with form-styles.ts & Modal.tsx)
7. `modules/dashboard/<key>/components/<Pascal>Table.tsx` (Table with Pagination.tsx & RBAC)
8. `modules/dashboard/<key>/pages/<Pascal>Page.tsx` (Server page with requirePageAccess)
9. `app/(dashboard)/dashboard/<plural_slug>/page.tsx` (Thin router wrapper with Suspense skeleton)

## 3. Activation & Database Integration
1. **Prisma Model**: Add the model in `prisma/schema.prisma` with UUIDv7 primary key:
   ```prisma
   model <Pascal> {
     uuid        String   @id @default(uuid(7)) @db.Uuid
     name        String   @db.VarChar(150)
     description String?  @db.VarChar(500)
     sortOrder   Int      @default(0) @map("sort_order")
     isActive    Boolean  @default(true) @map("is_active")
     createdAt   DateTime @default(now()) @map("created_at")
     updatedAt   DateTime @updatedAt @map("updated_at")

     @@map("<plural_slug>")
   }
   ```
2. **Apply Migration**:
   ```bash
   npm run db:migrate -- --name add_<key>
   ```
3. **Register Constants**:
   - Add to `common/constants/rbac.constant.ts` (`FEATURES` array):
     `{ key: "<key>", name: "<Label>", desc: "Kelola data <Label>" }`
   - Add to `common/constants/navigation.constant.ts` (`NAV_GROUPS`) with a Lucide icon.
4. **Sync Permissions**:
   ```bash
   npm run db:sync
   ```

## 4. Verification Gate
Always verify:
```bash
npm run lint
npx tsc --noEmit
```
