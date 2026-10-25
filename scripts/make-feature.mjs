#!/usr/bin/env node
/**
 * trcodes Enterprise Scaffolding CLI
 * Men-generate modul dashboard enterprise secara otomatis dan mendaftarkannya langsung ke sistem:
 * 1. *.schema.ts (Zod validation & TypeScript types)
 * 2. *.service.ts (Prisma mutations + audit log + server-only [+ image handling])
 * 3. *.queries.ts (Prisma list queries + pagination + server-only)
 * 4. *.actions.ts (Next.js Server Actions + requirePermission [+ upload action])
 * 5. *.hooks.ts (TanStack React Query hooks)
 * 6. components/*Modal.tsx (Form modal dengan form-styles.ts & Modal.tsx)
 * 7. components/*Table.tsx (Table component dengan Pagination.tsx & RBAC)
 * 8. components/*ImageField.tsx (Komponen upload gambar - jika --with-image)
 * 9. pages/*Page.tsx (Server page dengan requirePageAccess)
 * 10. app/(dashboard)/dashboard/* (Router wrapper dengan Suspense skeleton)
 *
 * Penggunaan:
 *   node scripts/make-feature.mjs <feature_key> "<Feature Label>" [plural_slug] [options]
 *
 * Opsi:
 *   --with-image, -i   Sertakan fitur upload gambar/foto moduler lengkap
 *   --no-auto          Jangan mendaftarkan otomatis ke Prisma, RBAC, dan Navigasi
 *
 * Contoh:
 *   node scripts/make-feature.mjs product "Katalog Produk" products
 *   node scripts/make-feature.mjs product "Katalog Produk" products --with-image
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rawArgs = process.argv.slice(2);
const withImage = rawArgs.includes("--with-image") || rawArgs.includes("-i");
const noAuto = rawArgs.includes("--no-auto");
const args = rawArgs.filter((a) => !a.startsWith("-"));

if (args.length < 2) {
  console.log(`
\x1b[33mPenggunaan:\x1b[0m
  npm run make:feature <feature_key> "<Feature Label>" [plural_slug] [opsi]

\x1b[36mOpsi:\x1b[0m
  --with-image, -i    Sertakan fungsionalitas unggah gambar/foto moduler
  --no-auto           Jangan daftarkan otomatis ke Prisma, RBAC, dan Navigasi

\x1b[36mContoh:\x1b[0m
  npm run make:feature product "Katalog Produk" products
  npm run make:feature product "Katalog Produk" products --with-image
  npm run make:feature supplier "Pemasok" suppliers
`);
  process.exit(1);
}

const rawKey = args[0].toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
const label = args[1].trim();
const pluralSlug = (args[2] || `${rawKey}s`).toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

// Helper casing
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

const pascal = toPascalCase(rawKey);
const camel = toCamelCase(rawKey);
const key = rawKey;

const targetDir = path.join(process.cwd(), "modules", "dashboard", key);
const componentsDir = path.join(targetDir, "components");
const pagesDir = path.join(targetDir, "pages");
const appRouteDir = path.join(process.cwd(), "app", "(dashboard)", "dashboard", pluralSlug);

if (fs.existsSync(targetDir)) {
  console.error(`\x1b[31mError:\x1b[0m Direktori modul sudah ada di ${targetDir}`);
  process.exit(1);
}

fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(pagesDir, { recursive: true });
fs.mkdirSync(appRouteDir, { recursive: true });

// ==========================================
// 1. SCHEMA
// ==========================================
const schemaContent = `import { z } from "zod";

export const ${camel}Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(150, "Nama maksimal 150 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
${
  withImage
    ? `  imageUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
`
    : ""
}  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ${pascal}Input = z.output<typeof ${camel}Schema>;

export type ${pascal}FormInput = {
  name: string;
  description: string;
${withImage ? "  imageUrl: string;\n" : ""}  sortOrder: number;
  isActive: boolean;
};

export type ${pascal}Row = {
  uuid: string;
  name: string;
  description: string | null;
${withImage ? "  imageUrl: string | null;\n" : ""}  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
`;

// ==========================================
// 2. SERVICE
// ==========================================
const serviceContent = `import "server-only";
${
  withImage
    ? `import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
`
    : ""
}import { prisma } from "@/common/lib/db";
import { recordAudit } from "@/common/lib/audit";
import { AppError, errorCode } from "@/common/utils/errors";
import type { ${pascal}Input } from "./${key}.schema";
${
  withImage
    ? `
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "${pluralSlug}");
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export async function save${pascal}Image(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError("Ukuran gambar maksimal 2MB", "imageUrl");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 8) {
    throw new AppError("Berkas gambar tidak valid", "imageUrl");
  }

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    throw new AppError("Format gambar harus JPEG, PNG, atau WebP", "imageUrl");
  }

  const ext = isPng ? "png" : isWebp ? "webp" : "jpg";
  const filename = \`\${crypto.randomUUID()}.\${ext}\`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes));

  return \`/uploads/${pluralSlug}/\${filename}\`;
}

export async function delete${pascal}Image(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/${pluralSlug}/")) return;
  const basename = path.basename(imageUrl);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, basename));
  } catch {
    // Abaikan jika berkas tidak ditemukan
  }
}
`
    : ""
}
export async function create${pascal}(input: ${pascal}Input) {
  try {
    const row = await prisma.${camel}.create({
      data: {
        name: input.name,
        description: input.description || null,
${withImage ? "        imageUrl: input.imageUrl || null,\n" : ""}        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive,
      },
      select: { uuid: true, name: true },
    });

    await recordAudit({
      action: "${key}.add",
      targetType: "${key}",
      targetUuid: row.uuid,
      detail: \`Menambahkan ${label}: \${row.name}\`,
    });

    return row;
  } catch (e) {
    if (errorCode(e) === "P2002") {
      throw new AppError("Data dengan nama ini sudah terdaftar", "name");
    }
    throw e;
  }
}

export async function update${pascal}(uuid: string, input: ${pascal}Input) {
  try {
${
  withImage
    ? `    const current = await prisma.${camel}.findUnique({
      where: { uuid },
      select: { imageUrl: true },
    });
    if (current?.imageUrl && current.imageUrl !== input.imageUrl) {
      await delete${pascal}Image(current.imageUrl);
    }
`
    : ""
}    const row = await prisma.${camel}.update({
      where: { uuid },
      data: {
        name: input.name,
        description: input.description || null,
${withImage ? "        imageUrl: input.imageUrl || null,\n" : ""}        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive,
      },
      select: { uuid: true, name: true },
    });

    await recordAudit({
      action: "${key}.edit",
      targetType: "${key}",
      targetUuid: row.uuid,
      detail: \`Memperbarui ${label}: \${row.name}\`,
    });

    return row;
  } catch (e) {
    if (errorCode(e) === "P2002") {
      throw new AppError("Data dengan nama ini sudah terdaftar", "name");
    }
    throw e;
  }
}

export async function delete${pascal}(uuid: string) {
  const existing = await prisma.${camel}.findUnique({
    where: { uuid },
    select: { name: true${withImage ? ", imageUrl: true" : ""} },
  });

${
  withImage
    ? `  if (existing?.imageUrl) {
    await delete${pascal}Image(existing.imageUrl);
  }
`
    : ""
}  await prisma.${camel}.delete({ where: { uuid } });

  await recordAudit({
    action: "${key}.delete",
    targetType: "${key}",
    targetUuid: uuid,
    detail: \`Menghapus ${label}: \${existing?.name ?? uuid}\`,
  });

  return { success: true };
}
`;

// ==========================================
// 3. QUERIES
// ==========================================
const queriesContent = `import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ${pascal}Row } from "./${key}.schema";

export type Get${pascal}Params = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "name" | "sortOrder" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type ${pascal}ListResult = {
  data: ${pascal}Row[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function get${pascal}List(
  params: Get${pascal}Params = {}
): Promise<${pascal}ListResult> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 10));
  const skip = (page - 1) * pageSize;
  const search = params.search?.trim();

  const where: Prisma.${pascal}WhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const orderBy: Prisma.${pascal}OrderByWithRelationInput = params.sortBy
    ? { [params.sortBy]: params.sortOrder || "desc" }
    : { sortOrder: "asc" };

  const [total, data] = await Promise.all([
    prisma.${camel}.count({ where }),
    prisma.${camel}.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  return {
    data: data as ${pascal}Row[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
`;

// ==========================================
// 4. ACTIONS
// ==========================================
const actionsContent = `"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { requirePermission } from "@/common/lib/auth";
import { parseInput, uuidSchema } from "@/common/utils/zod";
import { ${camel}Schema } from "./${key}.schema";
import {
  create${pascal},
  delete${pascal},
  update${pascal},${withImage ? `\n  save${pascal}Image,` : ""}
} from "./${key}.service";

function refresh() {
  revalidatePath("/dashboard/${pluralSlug}");
}

export async function create${pascal}Action(input: unknown) {
  return handleAction(async () => {
    await requirePermission("${key}", "add");
    const data = parseInput(${camel}Schema, input);
    const result = await create${pascal}(data);
    refresh();
    return result;
  }, "${label} berhasil ditambahkan");
}

export async function update${pascal}Action(id: string, input: unknown) {
  return handleAction(async () => {
    await requirePermission("${key}", "edit");
    const uuid = parseInput(uuidSchema, id);
    const data = parseInput(${camel}Schema, input);
    await update${pascal}(uuid, data);
    refresh();
  }, "${label} berhasil diperbarui");
}

export async function delete${pascal}Action(id: string) {
  return handleAction(async () => {
    await requirePermission("${key}", "delete");
    const uuid = parseInput(uuidSchema, id);
    await delete${pascal}(uuid);
    refresh();
  }, "${label} berhasil dihapus");
}
${
  withImage
    ? `
export async function upload${pascal}ImageAction(formData: FormData) {
  return handleAction(async () => {
    await requirePermission("${key}", "add");
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("Berkas gambar tidak ditemukan");
    }
    const url = await save${pascal}Image(file);
    return { url };
  }, "Gambar berhasil diunggah");
}
`
    : ""
}`;

// ==========================================
// 5. HOOKS
// ==========================================
const hooksContent = `"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  create${pascal}Action,
  delete${pascal}Action,
  update${pascal}Action,
} from "./${key}.actions";
import type { ${pascal}Input } from "./${key}.schema";

export const ${camel}Keys = {
  all: ["${key}"] as const,
  lists: () => [...${camel}Keys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...${camel}Keys.lists(), params] as const,
};

export function useCreate${pascal}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ${pascal}Input) => create${pascal}Action(input),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: ${camel}Keys.all });
    },
  });
}

export function useUpdate${pascal}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ${pascal}Input }) =>
      update${pascal}Action(id, input),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: ${camel}Keys.all });
    },
  });
}

export function useDelete${pascal}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delete${pascal}Action(id),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: ${camel}Keys.all });
    },
  });
}
`;

// ==========================================
// 6. IMAGE FIELD COMPONENT (Optional)
// ==========================================
const imageFieldContent = withImage
  ? `"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { swalError } from "@/common/utils/swal";
import { upload${pascal}ImageAction } from "../${key}.actions";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export default function ${pascal}ImageField({ value, onChange, disabled }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(value ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      swalError("Ukuran terlalu besar", "Ukuran gambar maksimal adalah 2MB");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await upload${pascal}ImageAction(formData);
        if (res.ok && res.data?.url) {
          setPreview(res.data.url);
          onChange(res.data.url);
        } else {
          swalError("Gagal mengunggah", res.message ?? "Terjadi kesalahan");
        }
      } catch (err: unknown) {
        swalError("Error", err instanceof Error ? err.message : "Gagal mengunggah gambar");
      }
    });
  };

  const handleClear = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
        Gambar ${label}
      </label>
      <div className="flex items-center gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-slate-300">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImagePlus className="h-8 w-8 text-slate-400" />
          )}

          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs">
              <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled || isPending}
            onChange={handleFileChange}
          />

          <button
            type="button"
            disabled={disabled || isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5 text-slate-500" />
            {preview ? "Ganti Gambar" : "Unggah Gambar"}
          </button>

          {preview && (
            <button
              type="button"
              disabled={disabled || isPending}
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              Hapus Gambar
            </button>
          )}
          <p className="text-[11px] text-slate-500">Maks. 2MB (JPG, PNG, atau WebP)</p>
        </div>
      </div>
    </div>
  );
}
`
  : "";

// ==========================================
// 7. MODAL COMPONENT
// ==========================================
const modalContent = `"use client";

import { useState, useTransition } from "react";
import { Package } from "lucide-react";
import Modal from "@/common/components/Modal";
import {
  checkboxCardCls,
  checkboxInputCls,
  errorCls,
  inputCls,
  labelCls,
  numberInputCls,
  textareaCls,
} from "@/common/utils/form-styles";
import { swalError, swalSuccess } from "@/common/utils/swal";
import { ${camel}Schema, type ${pascal}FormInput, type ${pascal}Row } from "../${key}.schema";
import { useCreate${pascal}, useUpdate${pascal} } from "../${key}.hooks";${
  withImage ? `\nimport ${pascal}ImageField from "./${pascal}ImageField";` : ""
}

type Props = {
  item: ${pascal}Row | null;
  onClose: () => void;
};

export default function ${pascal}Modal({ item, onClose }: Props) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState<${pascal}FormInput>({
    name: item?.name ?? "",
    description: item?.description ?? "",
${withImage ? `    imageUrl: item?.imageUrl ?? "",\n` : ""}    sortOrder: item?.sortOrder ?? 0,
    isActive: item?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const createMutation = useCreate${pascal}();
  const updateMutation = useUpdate${pascal}();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = ${camel}Schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path) fieldErrors[String(path)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (item) {
          const res = await updateMutation.mutateAsync({
            id: item.uuid,
            input: parsed.data,
          });
          if (res.ok) {
            swalSuccess(res.message ?? "Data berhasil diperbarui");
            onClose();
          } else {
            swalError("Gagal memperbarui", res.message);
          }
        } else {
          const res = await createMutation.mutateAsync(parsed.data);
          if (res.ok) {
            swalSuccess(res.message ?? "Data berhasil ditambahkan");
            onClose();
          } else {
            swalError("Gagal menambahkan", res.message);
          }
        }
      } catch (err: unknown) {
        swalError("Error", err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  };

  const pending = isPending || createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Ubah ${label}" : "Tambah ${label}"}
      subtitle={
        isEdit
          ? "Perbarui informasi data yang tersimpan."
          : "Lengkapi formulir di bawah ini untuk menambahkan data baru."
      }
      icon={Package}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
${
  withImage
    ? `        <${pascal}ImageField
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          disabled={pending}
        />
`
    : ""
}        <div>
          <label className={labelCls}>Nama ${label}</label>
          <input
            type="text"
            className={inputCls}
            placeholder="Masukkan nama ${label.toLowerCase()}..."
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            disabled={pending}
          />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        <div>
          <label className={labelCls}>Deskripsi</label>
          <textarea
            rows={3}
            className={textareaCls}
            placeholder="Deskripsi singkat..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            disabled={pending}
          />
          {errors.description && <p className={errorCls}>{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Urutan</label>
            <input
              type="number"
              className={numberInputCls}
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
              }
              disabled={pending}
            />
          </div>

          <div>
            <label className={labelCls}>Status Publikasi</label>
            <label className={checkboxCardCls}>
              <input
                type="checkbox"
                className={checkboxInputCls}
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                disabled={pending}
              />
              <span className="text-xs font-semibold text-slate-800">
                {form.isActive ? "Aktif (Dipublikasi)" : "Nonaktif (Draft)"}
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Data"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
`;

// ==========================================
// 8. TABLE COMPONENT
// ==========================================
const tableContent = `"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";${
  withImage ? '\nimport Image from "next/image";' : ""
}
import Pagination from "@/common/components/Pagination";
import { usePermission } from "@/common/context/PermissionContext";
import { swalConfirm, swalError, swalSuccess } from "@/common/utils/swal";
import type { ${pascal}Row } from "../${key}.schema";
import { useDelete${pascal} } from "../${key}.hooks";
import ${pascal}Modal from "./${pascal}Modal";

type Props = {
  initialData: ${pascal}Row[];
  total: number;
  initialPage: number;
  initialPageSize: number;
};

export default function ${pascal}Table({
  initialData,
  total,
  initialPage,
  initialPageSize,
}: Props) {
  const { can } = usePermission();
  const [data, setData] = useState(initialData);
  const [selectedItem, setSelectedItem] = useState<${pascal}Row | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState<number | "all">(initialPageSize);

  const deleteMutation = useDelete${pascal}();

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: ${pascal}Row) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: ${pascal}Row) => {
    const confirmed = await swalConfirm(
      \`Hapus ${label}?\`,
      \`Data "\${item.name}" akan dihapus permanen dari sistem.\`
    );
    if (!confirmed) return;

    try {
      const res = await deleteMutation.mutateAsync(item.uuid);
      if (res.ok) {
        swalSuccess(res.message ?? "Data berhasil dihapus");
        setData((prev) => prev.filter((d) => d.uuid !== item.uuid));
      } else {
        swalError("Gagal menghapus", res.message);
      }
    } catch (err: unknown) {
      swalError("Error", err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ${label.toLowerCase()}..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:border-slate-900 focus:outline-hidden"
          />
        </div>

        {can("${key}", "add") && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Tambah ${label}
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Nama ${label}</th>
                <th className="px-6 py-3.5">Deskripsi</th>
                <th className="px-6 py-3.5">Urutan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Package className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    Belum ada data ${label.toLowerCase()}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.uuid} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
${
  withImage
    ? `                        {item.imageUrl ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : null}
`
    : ""
}                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-slate-500">
                      {item.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.sortOrder}</td>
                    <td className="px-6 py-4">
                      <span
                        className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold \${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20"
                        }\`}
                      >
                        {item.isActive ? "Aktif" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {can("${key}", "edit") && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Ubah"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {can("${key}", "delete") && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-100 p-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <${pascal}Modal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
`;

// ==========================================
// 9. PAGE COMPONENT
// ==========================================
const pageContent = `import PageHeader from "@/common/components/PageHeader";
import { requirePageAccess } from "@/common/lib/auth";
import { get${pascal}List } from "../${key}.queries";
import ${pascal}Table from "../components/${pascal}Table";

type Props = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
};

export default async function ${pascal}Page({ searchParams }: Props) {
  await requirePageAccess("${key}");

  const params = searchParams ? await searchParams : {};
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const search = params.search || "";

  const { data, total } = await get${pascal}List({
    page,
    pageSize,
    search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="${label}"
        desc="Kelola data ${label.toLowerCase()} dan status publikasinya di sistem."
      />

      <${pascal}Table
        initialData={data}
        total={total}
        initialPage={page}
        initialPageSize={pageSize}
      />
    </div>
  );
}
`;

// ==========================================
// 10. APP ROUTER WRAPPER
// ==========================================
const appRouteContent = `import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import ${pascal}Page from "@/modules/dashboard/${key}/pages/${pascal}Page";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <${pascal}Page />
    </Suspense>
  );
}
`;

// ==========================================
// WRITE FILES
// ==========================================
fs.writeFileSync(path.join(targetDir, `${key}.schema.ts`), schemaContent);
fs.writeFileSync(path.join(targetDir, `${key}.service.ts`), serviceContent);
fs.writeFileSync(path.join(targetDir, `${key}.queries.ts`), queriesContent);
fs.writeFileSync(path.join(targetDir, `${key}.actions.ts`), actionsContent);
fs.writeFileSync(path.join(targetDir, `${key}.hooks.ts`), hooksContent);
if (withImage) {
  fs.writeFileSync(path.join(componentsDir, `${pascal}ImageField.tsx`), imageFieldContent);
}
fs.writeFileSync(path.join(componentsDir, `${pascal}Modal.tsx`), modalContent);
fs.writeFileSync(path.join(componentsDir, `${pascal}Table.tsx`), tableContent);
fs.writeFileSync(path.join(pagesDir, `${pascal}Page.tsx`), pageContent);
fs.writeFileSync(path.join(appRouteDir, "page.tsx"), appRouteContent);

// ==========================================
// AUTO-REGISTRATION (Prisma, RBAC, Navigasi)
// ==========================================
let autoRegistered = false;
if (!noAuto) {
  try {
    // A. PRISMA SCHEMA
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    if (fs.existsSync(schemaPath)) {
      let schemaText = fs.readFileSync(schemaPath, "utf8");
      if (!schemaText.includes(`model ${pascal} {`)) {
        const prismaModel = `
model ${pascal} {
  uuid        String   @id @default(uuid(7)) @db.Uuid
  name        String   @db.VarChar(150)
  description String?  @db.VarChar(500)
${withImage ? '  imageUrl    String?  @map("image_url") @db.VarChar(255)\n' : ""}  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([isActive, sortOrder])
  @@map("${pluralSlug}")
}
`;
        fs.writeFileSync(schemaPath, schemaText + prismaModel);
      }
    }

    // B. RBAC CONSTANT
    const rbacPath = path.join(process.cwd(), "common", "constants", "rbac.constant.ts");
    if (fs.existsSync(rbacPath)) {
      let rbacText = fs.readFileSync(rbacPath, "utf8");
      if (!rbacText.includes(`key: "${key}"`)) {
        const featureEntry = `  { key: "${key}", name: "${label}", desc: "Kelola data ${label}" },\n`;
        rbacText = rbacText.replace(/(\n\] as const;)/, `,\n${featureEntry}] as const;`);
        fs.writeFileSync(rbacPath, rbacText);
      }
    }

    // C. NAVIGATION CONSTANT
    const navPath = path.join(process.cwd(), "common", "constants", "navigation.constant.ts");
    if (fs.existsSync(navPath)) {
      let navText = fs.readFileSync(navPath, "utf8");
      if (!navText.includes(`feature: "${key}"`)) {
        const navEntry = `      {\n        label: "${label}",\n        href: "/dashboard/${pluralSlug}",\n        icon: Package,\n        feature: "${key}",\n      },\n`;
        if (navText.includes('label: "Master Data"')) {
          navText = navText.replace(
            /(label: "Master Data",\s*items: \[\s*)/,
            `$1${navEntry}`
          );
        } else {
          navText = navText.replace(
            /(items: \[\s*)/,
            `$1${navEntry}`
          );
        }
        fs.writeFileSync(navPath, navText);
      }
    }

    // D. TRIGGER DB SYNC
    execSync("npx tsx scripts/sync-features.ts", { stdio: "ignore" });
    autoRegistered = true;
  } catch (err) {
    console.warn("\x1b[33mWarning:\x1b[0m Registrasi otomatis sebagian gagal, silakan cek manual:", err.message);
  }
}

console.log(`
\x1b[32m✔ Sukses!\x1b[0m Modul \x1b[1m${label}\x1b[0m (\x1b[36m${key}\x1b[0m) berhasil di-generate secara lengkap${withImage ? " \x1b[35m(dengan fitur upload gambar)\x1b[0m" : ""}:

  📂 modules/dashboard/${key}/
    ├── ${key}.schema.ts
    ├── ${key}.service.ts
    ├── ${key}.queries.ts
    ├── ${key}.actions.ts
    ├── ${key}.hooks.ts
    ├── components/
    │   ├── ${pascal}Modal.tsx${withImage ? `\n    │   ├── ${pascal}ImageField.tsx` : ""}
    │   └── ${pascal}Table.tsx
    └── pages/
        └── ${pascal}Page.tsx

  📂 app/(dashboard)/dashboard/${pluralSlug}/
    └── page.tsx
${
  autoRegistered
    ? `
\x1b[32m✔ Auto-Registration Selesai:\x1b[0m
  1. Model \x1b[36m${pascal}\x1b[0m ditambahkan ke \x1b[36mprisma/schema.prisma\x1b[0m
  2. Fitur \x1b[36m"${key}"\x1b[0m didaftarkan ke \x1b[36mcommon/constants/rbac.constant.ts\x1b[0m
  3. Menu \x1b[36m"${label}"\x1b[0m ditambahkan ke sidebar di \x1b[36mcommon/constants/navigation.constant.ts\x1b[0m
  4. Hak akses Super Admin otomatis disinkronkan ke basis data!

\x1b[33mLangkah Akhir (Migrasi Database):\x1b[0m
  Jalankan: \x1b[36mnpm run db:migrate -- --name add_${key}\x1b[0m
`
    : `
\x1b[33mLangkah Selanjutnya (Manual):\x1b[0m
  1. Tambahkan model di prisma/schema.prisma
  2. Daftarkan di rbac.constant.ts & navigation.constant.ts
  3. Jalankan: npm run db:sync
`
}
`);
