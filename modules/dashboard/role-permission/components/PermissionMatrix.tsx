// src/modules/role-permission/components/PermissionMatrix.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Info, RotateCcw, Save } from "lucide-react";
import { usePermission } from "@/common/context/PermissionContext";
import { ACTIONS, ACTION_LABEL, type Action } from "@/common/constants/rbac.constant";
import { swalConfirm, swalError, swalSuccess } from "@/common/utils/swal";
import { checkboxInputCls } from "@/common/utils/form-styles";
import { saveRolePermissionsAction } from "../role-permission.actions";
import type { MatrixFeature } from "../role-permission.schema";

type Props = {
  roleUuid: string;
  features: MatrixFeature[];
  isOwnRole: boolean; // role yang sedang dipakai oleh user yang login
  locked?: boolean;
  lockedMessage?: string;
};

const keyOf = (featureUuid: string, action: Action) => `${featureUuid}:${action}`;

function toSet(features: MatrixFeature[]) {
  return new Set(
    features.flatMap((f) => f.granted.map((a) => keyOf(f.uuid, a)))
  );
}

// Checkbox dengan keadaan "sebagian" (indeterminate) untuk toggle baris dan kolom
function TriCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className={checkboxInputCls}
    />
  );
}

export default function PermissionMatrix({
  roleUuid,
  features,
  isOwnRole,
  locked = false,
  lockedMessage,
}: Props) {
  const { can } = usePermission();
  const canEdit = can("role-permission", "edit") && !locked;

  // `key` di page membuat komponen ini dibuat ulang saat data server berubah,
  // jadi baseline selalu sama dengan data terakhir dari server
  const [baseline] = useState(() => toSet(features));
  const [granted, setGranted] = useState(() => new Set(baseline));
  const [pending, setPending] = useState(false);

  let changes = 0;
  for (const k of granted) if (!baseline.has(k)) changes++;
  for (const k of baseline) if (!granted.has(k)) changes++;
  const dirty = changes > 0;

  function setKeys(keys: string[], value: boolean) {
    setGranted((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (value) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  function status(keys: string[]) {
    const count = keys.filter((k) => granted.has(k)).length;
    return {
      disabled: !canEdit || keys.length === 0,
      checked: keys.length > 0 && count === keys.length,
      indeterminate: count > 0 && count < keys.length,
    };
  }

  async function handleSave() {
    if (!canEdit || !dirty || pending) return;

    if (isOwnRole) {
      const ok = await swalConfirm({
        title: "Ubah hak akses peran kamu sendiri?",
        text: "Peran ini sedang kamu pakai. Perubahan langsung berlaku dan bisa membatasi akses yang sedang kamu gunakan.",
        confirmText: "Ya, simpan",
      });
      if (!ok) return;
    }

    setPending(true);
    const res = await saveRolePermissionsAction(roleUuid, {
      entries: features.map((f) => ({
        featureUuid: f.uuid,
        actions: ACTIONS.filter((a) => granted.has(keyOf(f.uuid, a))),
      })),
    });
    setPending(false);

    if (!res.ok) {
      swalError(
        "Gagal menyimpan izin",
        res.fieldErrors?.entries ?? res.message
      );
      return;
    }
    swalSuccess(res.message ?? "Izin berhasil disimpan");
  }

  return (
    <div className="space-y-4">
      {!canEdit && (
        <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-700">
          <Info className="mt-0.5 size-4 shrink-0" />
          {locked
            ? lockedMessage
            : "Kamu hanya dapat melihat izin, tidak dapat mengubahnya."}
        </div>
      )}

      {canEdit && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500" aria-live="polite">
            {dirty
              ? `${changes} perubahan belum disimpan`
              : "Belum ada perubahan"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGranted(new Set(baseline))}
              disabled={!dirty || pending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || pending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" />
              {pending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Feature
              </th>
              {ACTIONS.map((action) => {
                const keys = features
                  .filter((f) => f.availableActions.includes(action))
                  .map((f) => keyOf(f.uuid, action));
                const s = status(keys);

                return (
                  <th
                    key={action}
                    scope="col"
                    className="px-4 py-3 text-center"
                  >
                    <label className="inline-flex flex-col items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {ACTION_LABEL[action]}
                      <TriCheckbox
                        checked={s.checked}
                        indeterminate={s.indeterminate}
                        disabled={s.disabled}
                        onChange={(v) => setKeys(keys, v)}
                        label={`Pilih semua aksi ${ACTION_LABEL[action]}`}
                      />
                    </label>
                  </th>
                );
              })}
              <th
                scope="col"
                className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Semua
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {features.length === 0 && (
              <tr>
                <td
                  colSpan={ACTIONS.length + 2}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  Belum ada feature
                </td>
              </tr>
            )}

            {features.map((f) => {
              const rowKeys = f.availableActions.map((a) => keyOf(f.uuid, a));
              const rowStatus = status(rowKeys);

              return (
                <tr key={f.uuid} className="transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500">
                      <code>{f.key}</code>
                      {f.desc ? ` · ${f.desc}` : ""}
                    </p>
                  </td>

                  {ACTIONS.map((action) => {
                    const available = f.availableActions.includes(action);
                    const k = keyOf(f.uuid, action);

                    return (
                      <td key={action} className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={granted.has(k)}
                          disabled={!canEdit || !available}
                          onChange={() => setKeys([k], !granted.has(k))}
                          title={
                            available
                              ? undefined
                              : "Aksi tidak tersedia pada feature ini"
                          }
                          aria-label={`${ACTION_LABEL[action]} ${f.name}`}
                          className={checkboxInputCls}
                        />
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center">
                    <TriCheckbox
                      checked={rowStatus.checked}
                      indeterminate={rowStatus.indeterminate}
                      disabled={rowStatus.disabled}
                      onChange={(v) => setKeys(rowKeys, v)}
                      label={`Pilih semua aksi ${f.name}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
