// src/utils/form-styles.ts

/**
 * Token styling terpusat untuk seluruh elemen input form di modul dashboard.
 * Menjamin konsistensi visual, focus ring, feedback error, dan responsivitas.
 */

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs outline-hidden transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";

export const selectCls =
  "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-2xs outline-hidden transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 aria-[invalid=true]:border-red-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";

export const textareaCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs outline-hidden transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100 disabled:bg-slate-100 disabled:text-slate-500 resize-y min-h-[90px]";

export const numberInputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 shadow-2xs outline-hidden transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";

export const checkboxCardCls =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 hover:border-slate-300 hover:bg-slate-50/80 transition shadow-2xs";

export const checkboxInputCls =
  "size-4.5 rounded-lg border-slate-300 text-blue-600 focus:ring-4 focus:ring-blue-100 accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";

export const labelCls =
  "mb-1.5 block text-sm font-semibold text-slate-700";

export const errorCls =
  "mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600";
