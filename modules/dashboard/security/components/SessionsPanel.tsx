"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Globe,
  LogOut,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { formatDateTime } from "@/common/utils/format-date-time";
import { swalConfirm, swalError, swalSuccess } from "@/common/utils/swal";
import type { ActiveSession } from "../security.schema";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "../security.actions";

function deviceLabel(userAgent: string | null) {
  if (!userAgent) return "Perangkat tidak dikenal";

  const browser = /Edg\//i.test(userAgent)
    ? "Edge"
    : /OPR\//i.test(userAgent)
      ? "Opera"
      : /Chrome\//i.test(userAgent)
        ? "Chrome"
        : /Firefox\//i.test(userAgent)
          ? "Firefox"
          : /Safari\//i.test(userAgent)
            ? "Safari"
            : "Browser";

  const os = /Windows/i.test(userAgent)
    ? "Windows"
    : /Android/i.test(userAgent)
      ? "Android"
      : /iPhone|iPad|iPod/i.test(userAgent)
        ? "iOS"
        : /Mac OS X/i.test(userAgent)
          ? "macOS"
          : /Linux/i.test(userAgent)
            ? "Linux"
            : "OS tidak dikenal";

  return `${browser} · ${os}`;
}

function isMobile(userAgent: string | null) {
  return Boolean(userAgent && /Android|iPhone|iPad|iPod/i.test(userAgent));
}

export default function SessionsPanel({
  sessions,
}: {
  sessions: ActiveSession[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const otherCount = sessions.filter((session) => !session.current).length;

  function handleRevoke(session: ActiveSession) {
    startTransition(async () => {
      const ok = await swalConfirm({
        title: "Cabut sesi perangkat ini?",
        text: "Perangkat tersebut harus login ulang untuk mengakses dashboard.",
        confirmText: "Ya, cabut",
        icon: "warning",
      });
      if (!ok) return;

      const res = await revokeSessionAction(session.uuid);
      if (!res.ok) {
        swalError("Gagal mencabut sesi", res.message);
        return;
      }

      swalSuccess("Sesi dicabut");
      router.refresh();
    });
  }

  function handleRevokeOthers() {
    startTransition(async () => {
      const ok = await swalConfirm({
        title: "Cabut semua sesi lain?",
        text: "Semua perangkat lain harus login ulang. Sesi saat ini tetap aktif.",
        confirmText: "Ya, cabut semua",
        icon: "warning",
      });
      if (!ok) return;

      const res = await revokeOtherSessionsAction();
      if (!res.ok) {
        swalError("Gagal mencabut sesi", res.message);
        return;
      }

      swalSuccess(
        "Sesi lain dicabut",
        `${res.data.count} sesi perangkat lain telah dikeluarkan.`
      );
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Monitor className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Sesi & perangkat
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Daftar sesi yang sedang aktif. Cabut sesi yang tidak kamu kenali
              atau sudah tidak dipakai.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRevokeOthers}
          disabled={pending || otherCount === 0}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="size-4" />
          {otherCount === 0 ? "Tidak ada sesi lain" : "Cabut sesi lain"}
        </button>
      </div>

      <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
        {sessions.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">
            Tidak ada sesi aktif yang tercatat.
          </p>
        ) : (
          sessions.map((session) => {
            const Icon = isMobile(session.userAgent)
              ? Smartphone
              : Monitor;

            return (
              <div
                key={session.uuid}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {deviceLabel(session.userAgent)}
                      </p>
                      {session.current && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck className="size-3" />
                          Sesi ini
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Globe className="size-3.5" />
                        {session.ip ?? "IP tidak tersedia"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        Aktif {formatDateTime(session.lastSeenAt)}
                      </span>
                      <span className="text-slate-400">
                        Masuk {formatDateTime(session.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(session)}
                    disabled={pending}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="size-3.5" />
                    Cabut
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Sesi berlaku maksimal 12 jam sejak login. Aktivitas terakhir
        diperbarui berkala.
      </p>
    </section>
  );
}
