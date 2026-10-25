// src/components/Pagination.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
};

// contoh: 1 ... 4 5 [6] 7 8 ... 20
function pageNumbers(page: number, total: number): (number | "...")[] {
  const set = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
}

const baseBtn =
  "inline-flex size-8.5 items-center justify-center rounded-xl border text-xs font-semibold transition shrink-0";
const styles = {
  idle: `${baseBtn} border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 shadow-2xs`,
  active: `${baseBtn} border-blue-600 bg-blue-600 text-white shadow-xs shadow-blue-500/25 ring-2 ring-blue-600/20`,
  disabled: `${baseBtn} pointer-events-none border-slate-100 bg-slate-50 text-slate-300`,
};

const PRESET_LIMITS = [10, 25, 50, 100];

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();

  const isPreset = PRESET_LIMITS.includes(limit);
  const isAll = limit >= 5000 || (total > 0 && limit >= total && !isPreset);

  const defaultSelectValue = isAll ? "all" : isPreset ? String(limit) : "custom";
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customInput, setCustomInput] = useState(!isPreset && !isAll ? String(limit) : "");

  const activeSelectValue = isCustomEditing ? "custom" : defaultSelectValue;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  function pageHref(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  function limitHref(newLimit: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("limit", String(newLimit));
    params.set("page", "1");
    return `${pathname}?${params.toString()}`;
  }

  function handleSetLimit(newLimit: number) {
    if (newLimit < 1) return;
    if (onLimitChange) {
      onLimitChange(newLimit);
    } else {
      router.push(limitHref(newLimit));
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;

    if (val === "custom") {
      setIsCustomEditing(true);
      setCustomInput(String(limit));
      return;
    }

    setIsCustomEditing(false);

    if (val === "all") {
      handleSetLimit(total > 0 ? total : 5000);
      return;
    }

    const num = Number(val);
    if (!Number.isNaN(num)) {
      handleSetLimit(num);
    }
  }

  function handleCustomLimitSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!Number.isNaN(val) && val > 0 && val <= 10000) {
      handleSetLimit(val);
      setIsCustomEditing(false);
    }
  }

  function renderPageItem(
    key: string,
    p: number,
    label: React.ReactNode,
    state: keyof typeof styles,
    ariaLabel?: string
  ) {
    if (state === "disabled") {
      return (
        <span
          key={key}
          className={styles.disabled}
          aria-disabled="true"
          aria-label={ariaLabel}
        >
          {label}
        </span>
      );
    }

    const current = state === "active" ? "page" : undefined;

    if (onPageChange) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={current}
          aria-label={ariaLabel}
          title={ariaLabel}
          className={styles[state]}
        >
          {label}
        </button>
      );
    }

    return (
      <Link
        key={key}
        href={pageHref(p)}
        aria-current={current}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={styles[state]}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav
      aria-label="Navigasi Halaman & Kontrol Data"
      className="flex flex-col gap-4 border-t border-slate-200/80 pt-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Info & Select Limit Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium text-slate-600">
            Menampilkan <span className="font-semibold text-slate-900">{from}</span>
            –
            <span className="font-semibold text-slate-900">{to}</span> dari{" "}
            <span className="font-semibold text-slate-900">{total}</span> data
            {totalPages > 1 && (
              <span className="ml-1 text-slate-400">
                (Hal. {page} dari {totalPages})
              </span>
            )}
          </p>

          <span className="hidden h-3.5 w-px bg-slate-200 sm:inline-block" />

          {/* Rows per page dropdown select */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <label htmlFor="limit-select" className="font-medium text-slate-600">
              Per halaman:
            </label>
            <div className="relative">
              <select
                id="limit-select"
                value={activeSelectValue}
                onChange={handleSelectChange}
                className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-2xs outline-hidden transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="10">10 data</option>
                <option value="25">25 data</option>
                <option value="50">50 data</option>
                <option value="100">100 data</option>
                <option value="all">Semua</option>
                <option value="custom">Kustom...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="size-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Custom Limit Input (muncul jika mode kustom aktif) */}
            {activeSelectValue === "custom" && (
              <form
                onSubmit={handleCustomLimitSubmit}
                className="flex items-center gap-1.5"
              >
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Nominal"
                  aria-label="Nominal baris kustom"
                  className="w-18 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!customInput}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs transition hover:bg-blue-100 disabled:opacity-40"
                >
                  Set
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Page Buttons: Navigasi Sebelum & Selanjutnya HANYA ICON */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {renderPageItem(
            "prev",
            page - 1,
            <ChevronLeft className="size-4" />,
            page > 1 ? "idle" : "disabled",
            "Sebelumnya"
          )}

          {pageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span
                key={`gap-${i}`}
                className="flex size-8.5 items-center justify-center text-xs text-slate-400"
              >
                ...
              </span>
            ) : (
              renderPageItem(
                `p-${p}`,
                p,
                p,
                p === page ? "active" : "idle",
                `Halaman ${p}`
              )
            )
          )}

          {renderPageItem(
            "next",
            page + 1,
            <ChevronRight className="size-4" />,
            page < totalPages ? "idle" : "disabled",
            "Berikutnya"
          )}
        </div>
      </div>
    </nav>
  );
}
