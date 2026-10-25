"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  listParamsSchema, type ListParams } from "@/common/utils/zod";

// Membaca page/limit/q dari URL, dan menulisnya kembali tanpa kunjungan ke server.
// Next.js menyinkronkan history.pushState/replaceState dengan useSearchParams.
export function useListParams() {
  const searchParams = useSearchParams();
  const raw = searchParams.toString();

  const params = useMemo<ListParams>(
    () => listParamsSchema.parse(Object.fromEntries(new URLSearchParams(raw))),
    [raw]
  );

  const update = useCallback(
    (mutate: (sp: URLSearchParams) => void, replace: boolean) => {
      const sp = new URLSearchParams(window.location.search);
      mutate(sp);
      const qs = sp.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;

      if (replace) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    },
    []
  );

  // ganti kata kunci: kembali ke halaman 1, riwayat back tidak penuh
  const setQuery = useCallback(
    (q: string) =>
      update((sp) => {
        if (q) sp.set("q", q);
        else sp.delete("q");
        sp.set("page", "1");
      }, true),
    [update]
  );

  // pindah halaman: masuk riwayat (tombol back berfungsi)
  const setPage = useCallback(
    (page: number, replace = false) =>
      update((sp) => sp.set("page", String(page)), replace),
    [update]
  );

  // ganti limit per halaman: kembali ke halaman 1
  const setLimit = useCallback(
    (limit: number, replace = false) =>
      update((sp) => {
        sp.set("limit", String(limit));
        sp.set("page", "1");
      }, replace),
    [update]
  );

  return { params, setQuery, setPage, setLimit };
}
