"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserRound,
  Layers,
  Inbox,
  Sparkles,
} from "lucide-react";

import RoleService, { type Role } from "@/services/auth/RoleService";
import FeatureService, { type Feature } from "@/services/auth/FeatureService";
import RolePermissionService, {
  type RolePermission,
} from "@/services/auth/RolePermissionService";
import UserService, { type User } from "@/services/auth/UserService";
import { useApp } from "@/contexts/AppContext";
import SecondaryButton from "@/components/button/SecondaryButton";
import AddButton from "@/components/button/AddButton";
import DeleteButton from "@/components/button/DeleteButton";
import EditButton from "@/components/button/EditButton";
import GhostButton from "@/components/button/GhostButton";

type RoleRow = Role & { _key: string };
type FeatureRow = Feature & { _key: string };
type PermissionRow = RolePermission & { _key: string };
type UserRow = User & { _key: string; password?: string };

type ActionKey = "isRead" | "isAdd" | "isEdit" | "isDelete";

type FeatureForm = {
  name: string;
  code: string;
  description: string;
  availableActions: string;
  isActive: boolean;
};

const ACTIONS: {
  key: ActionKey;
  code: string;
  label: string;
}[] = [
  { key: "isRead", code: "r", label: "Lihat" },
  { key: "isAdd", code: "a", label: "Tambah" },
  { key: "isEdit", code: "e", label: "Ubah" },
  { key: "isDelete", code: "d", label: "Hapus" },
];

const newKey = () => `${Date.now()}-${Math.random()}`;

const emptyRole = (): RoleRow => ({
  id: 0,
  _key: newKey(),
  name: "",
  description: "",
  isActive: true,
  createdAt: "",
  updatedAt: "",
});

const emptyFeatureForm = (): FeatureForm => ({
  name: "",
  code: "",
  description: "",
  availableActions: "r,a,e,d",
  isActive: true,
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function UsersPage() {
  // ==========================================
  // Setting Permission
  // ==========================================
  const { hasPermission, authLoading } = useApp();
  const featureCode = "USER_MANAGEMENT";
  const canRead = hasPermission(featureCode, "isRead");
  const canAdd = hasPermission(featureCode, "isAdd");
  const canEdit = hasPermission(featureCode, "isEdit");
  const canDelete = hasPermission(featureCode, "isDelete");

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [savingFeature, setSavingFeature] = useState(false);

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureForm, setFeatureForm] = useState<FeatureForm>(emptyFeatureForm);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const notify = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
  };

  const handleError = (error: unknown) => {
    notify(
      "error",
      error instanceof Error ? error.message : "Terjadi kesalahan."
    );
  };

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [roleResponse, featureResponse, permissionResponse, userResponse] =
        await Promise.all([
          RoleService.getAll(),
          FeatureService.getAll(),
          RolePermissionService.getAll(),
          UserService.getAll(),
        ]);

      const roleRows: RoleRow[] = roleResponse.data.map((item) => ({
        ...item,
        _key: `role-${item.id}`,
      }));

      setRoles(roleRows);

      setFeatures(
        featureResponse.data.map((item) => ({
          ...item,
          _key: `feature-${item.id}`,
        }))
      );

      setPermissions(
        permissionResponse.data.map((item) => ({
          ...item,
          _key: `permission-${item.id}`,
        }))
      );

      setUsers(
        userResponse.data.map((item) => ({
          ...item,
          _key: `user-${item.id}`,
          password: "",
        }))
      );

      setSelectedRoleId((currentId) => {
        if (
          currentId !== null &&
          roleRows.some((role) => role.id === currentId)
        ) {
          return currentId;
        }

        return roleRows[0]?.id ?? null;
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canRead) {
      void loadData();
    }
  }, [canRead, loadData]);

  // --------------------------------------------------
  // Selected parent and child data
  // --------------------------------------------------

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  const roleUsers = useMemo(
    () => users.filter((user) => user.roleId === selectedRoleId),
    [users, selectedRoleId]
  );

  const rolePermissions = useMemo(
    () =>
      permissions.filter((permission) => permission.roleId === selectedRoleId),
    [permissions, selectedRoleId]
  );

  const selectedRoleIndex = roles.findIndex(
    (role) => role.id === selectedRoleId
  );

  // --------------------------------------------------
  // Parent navigation
  // --------------------------------------------------

  const navigateRole = (direction: -1 | 1) => {
    if (roles.length === 0 || selectedRoleIndex < 0) return;

    const nextIndex = selectedRoleIndex + direction;

    if (nextIndex < 0 || nextIndex >= roles.length) return;

    setSelectedRoleId(roles[nextIndex].id);
    setNotice(null);
  };

  const addRole = () => {
    if (!canAdd) return;

    const role = emptyRole();

    setRoles((current) => [role, ...current]);
    setSelectedRoleId(0);
    setNotice({
      type: "success",
      message:
        "Form role baru siap diisi. Simpan role terlebih dahulu untuk mengelola pengguna dan hak akses.",
    });
  };

  const updateSelectedRole = (
    field: "name" | "description" | "isActive",
    value: string | boolean
  ) => {
    if (!selectedRole) return;

    setRoles((current) =>
      current.map((role) =>
        role._key === selectedRole._key ? { ...role, [field]: value } : role
      )
    );
  };

  // --------------------------------------------------
  // Save parent role
  // --------------------------------------------------

  const saveRole = async () => {
    if (!selectedRole) return;

    if (!selectedRole.name.trim()) {
      notify("error", "Nama role wajib diisi.");
      return;
    }

    if (selectedRole.id > 0 && !canEdit) return;
    if (selectedRole.id === 0 && !canAdd) return;

    setSavingRole(true);

    try {
      if (selectedRole.id > 0) {
        const response = await RoleService.update(selectedRole.id, {
          name: selectedRole.name.trim(),
          description: selectedRole.description || null,
          isActive: selectedRole.isActive,
        });

        await loadData();
        notify("success", "Role berhasil diperbarui.");
        void response;
      } else {
        const response = await RoleService.create({
          name: selectedRole.name.trim(),
          description: selectedRole.description || null,
          isActive: selectedRole.isActive,
        });

        const createdRoleId = response.data?.id;

        await loadData();

        if (typeof createdRoleId === "number") {
          setSelectedRoleId(createdRoleId);
        }

        notify(
          "success",
          "Role berhasil dibuat. Silakan atur pengguna dan hak aksesnya."
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSavingRole(false);
    }
  };

  // --------------------------------------------------
  // Delete role
  // --------------------------------------------------
  const cancelNewRole = () => {
    if (!selectedRole || selectedRole.id !== 0) return;

    const draftKey = selectedRole._key;

    setRoles((current) => current.filter((role) => role._key !== draftKey));

    setSelectedRoleId(roles.find((role) => role.id > 0)?.id ?? null);

    setNotice(null);
  };

  const deleteSelectedRole = async () => {
    if (!selectedRole) return;

    if (selectedRole.id === 0) {
      setRoles((current) =>
        current.filter((role) => role._key !== selectedRole._key)
      );

      setSelectedRoleId(roles.find((role) => role.id > 0)?.id ?? null);
      setNotice(null);
      return;
    }

    if (!canDelete) return;

    const confirmed = window.confirm(
      `Hapus role "${selectedRole.name}"? Role yang masih digunakan oleh pengguna tidak dapat dihapus.`
    );

    if (!confirmed) return;

    setDeletingKey(selectedRole._key);

    try {
      await RoleService.delete(selectedRole.id);

      const remainingRoles = roles.filter(
        (role) => role.id !== selectedRole.id
      );

      setRoles(remainingRoles);
      setSelectedRoleId(remainingRoles[0]?.id ?? null);

      await loadData();
      notify("success", "Role berhasil dihapus.");
    } catch (error) {
      handleError(error);
    } finally {
      setDeletingKey(null);
    }
  };

  // --------------------------------------------------
  // User grid
  // --------------------------------------------------

  const updateUser = (
    key: string,
    field: keyof UserRow,
    value: string | number | boolean
  ) => {
    setUsers((current) =>
      current.map((user) =>
        user._key === key ? { ...user, [field]: value } : user
      )
    );
  };

  const addUser = () => {
    if (!selectedRole || selectedRole.id <= 0 || !canAdd) {
      notify("error", "Simpan role terlebih dahulu sebelum menambah user.");
      return;
    }

    const row: UserRow = {
      id: 0,
      _key: newKey(),
      name: "",
      email: "",
      password: "",
      roleId: selectedRole.id,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };

    setUsers((current) => [row, ...current]);
  };

  const saveUser = async (row: UserRow) => {
    if (!row.name.trim() || !row.email.trim()) {
      notify("error", "Nama dan email pengguna wajib diisi.");
      return;
    }

    if (row.id === 0 && !row.password?.trim()) {
      notify("error", "Password wajib diisi untuk pengguna baru.");
      return;
    }

    if (row.id > 0 && !canEdit) return;
    if (row.id === 0 && !canAdd) return;

    setSavingKey(row._key);

    try {
      if (row.id > 0) {
        const payload: {
          name: string;
          email: string;
          roleId: number;
          isActive: boolean;
          password?: string;
        } = {
          name: row.name.trim(),
          email: row.email.trim(),
          roleId: selectedRole!.id,
          isActive: row.isActive,
        };

        if (row.password?.trim()) {
          payload.password = row.password;
        }

        await UserService.update(row.id, payload);
      } else {
        await UserService.create({
          name: row.name.trim(),
          email: row.email.trim(),
          password: row.password ?? "",
          roleId: selectedRole!.id,
          isActive: row.isActive,
        });
      }

      await loadData();
      notify("success", "Pengguna berhasil disimpan.");
    } catch (error) {
      handleError(error);
    } finally {
      setSavingKey(null);
    }
  };

  const cancelNewUser = (row: UserRow) => {
    if (row.id !== 0) return;

    setUsers((current) => current.filter((user) => user._key !== row._key));
  };

  const deleteUser = async (row: UserRow) => {
    if (row.id === 0) {
      setUsers((current) => current.filter((user) => user._key !== row._key));
      return;
    }

    if (!canDelete) return;

    if (!window.confirm(`Hapus pengguna "${row.name}"?`)) return;

    setDeletingKey(row._key);

    try {
      await UserService.delete(row.id);
      await loadData();
      notify("success", "Pengguna berhasil dihapus.");
    } catch (error) {
      handleError(error);
    } finally {
      setDeletingKey(null);
    }
  };

  // --------------------------------------------------
  // Permission grid
  // --------------------------------------------------

  const updatePermission = (key: string, field: ActionKey, value: boolean) => {
    setPermissions((current) =>
      current.map((permission) =>
        permission._key === key ? { ...permission, [field]: value } : permission
      )
    );
  };

  const getAvailableActions = (feature: FeatureRow) =>
    feature.availableActions
      .split(",")
      .map((action) => action.trim().toLowerCase());

  const savePermission = async (row: PermissionRow) => {
    if (row.id <= 0 || !canEdit) return;

    setSavingKey(row._key);

    try {
      await RolePermissionService.update(row.id, {
        roleId: row.roleId,
        featureId: row.featureId,
        isRead: row.isRead,
        isAdd: row.isAdd,
        isEdit: row.isEdit,
        isDelete: row.isDelete,
      });

      await loadData();
      notify("success", "Hak akses berhasil disimpan.");
    } catch (error) {
      handleError(error);
    } finally {
      setSavingKey(null);
    }
  };

  const deletePermission = async (row: PermissionRow) => {
    if (row.id <= 0 || !canDelete) return;

    const feature = features.find((item) => item.id === row.featureId);

    if (
      !window.confirm(
        `Hapus pengaturan hak akses untuk fitur "${
          feature?.name ?? "ini"
        }" pada role "${selectedRole?.name ?? ""}"?`
      )
    ) {
      return;
    }

    setDeletingKey(row._key);

    try {
      await RolePermissionService.delete(row.id);
      await loadData();
      notify("success", "Pengaturan hak akses berhasil dihapus.");
    } catch (error) {
      handleError(error);
    } finally {
      setDeletingKey(null);
    }
  };

  // --------------------------------------------------
  // Add feature modal
  // --------------------------------------------------

  const openFeatureModal = () => {
    if (!selectedRole || selectedRole.id <= 0) {
      notify("error", "Simpan role terlebih dahulu sebelum menambah fitur.");
      return;
    }

    if (!canAdd) return;

    setFeatureForm(emptyFeatureForm());
    setShowFeatureModal(true);
  };

  const saveFeature = async () => {
    if (!featureForm.name.trim() || !featureForm.code.trim()) {
      notify("error", "Nama dan kode fitur wajib diisi.");
      return;
    }

    if (!canAdd) return;

    setSavingFeature(true);

    try {
      await FeatureService.create({
        name: featureForm.name.trim(),
        code: featureForm.code.trim().toUpperCase(),
        description: featureForm.description.trim() || null,
        availableActions: featureForm.availableActions,
        isActive: featureForm.isActive,
      });

      setShowFeatureModal(false);
      await loadData();

      notify(
        "success",
        "Fitur berhasil dibuat. Hak aksesnya telah ditambahkan dengan semua aksi nonaktif."
      );
    } catch (error) {
      handleError(error);
    } finally {
      setSavingFeature(false);
    }
  };

  // --------------------------------------------------
  // Shared UI components
  // --------------------------------------------------

  const renderNotice = () => {
    if (!notice) return null;

    const isSuccess = notice.type === "success";

    return (
      <div
        role="status"
        className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-sm ${
          isSuccess
            ? "border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-800"
            : "border-rose-200 bg-linear-to-r from-rose-50 to-orange-50 text-rose-800"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {isSuccess ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <span className="font-medium">{notice.message}</span>
        </div>
        <GhostButton
          type="button"
          onClick={() => setNotice(null)}
          aria-label="Tutup notifikasi"
        >
          <X size={14} />
        </GhostButton>
      </div>
    );
  };

  const renderSectionHeading = (
    title: string,
    description: string,
    Icon: typeof Shield,
    tone: "indigo" | "emerald" | "amber" = "indigo"
  ) => {
    const toneMap = {
      indigo: {
        bg: "bg-linear-to-br from-indigo-500 to-violet-500",
        text: "text-indigo-600",
        ring: "ring-indigo-100",
      },
      emerald: {
        bg: "bg-linear-to-br from-emerald-500 to-teal-500",
        text: "text-emerald-600",
        ring: "ring-emerald-100",
      },
      amber: {
        bg: "bg-linear-to-br from-amber-500 to-orange-500",
        text: "text-amber-600",
        ring: "ring-amber-100",
      },
    } as const;

    const t = toneMap[tone];

    return (
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-4 ${t.bg} ${t.ring}`}
          >
            <Icon size={18} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                {title}
              </h2>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderEmpty = (message: string) => (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 text-slate-400 shadow-inner">
        <Inbox size={22} />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{message}</p>
    </div>
  );

  const renderCheckbox = (
    checked: boolean,
    onChange: (value: boolean) => void,
    disabled: boolean,
    label: string
  ) => (
    <label className="inline-flex cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-indigo-600 transition disabled:cursor-not-allowed disabled:opacity-40"
      />
    </label>
  );

  if (authLoading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Memuat halaman pengguna
        </h1>
      </div>
    );
  }

  // --------------------------------------------------
  // Access denied
  // --------------------------------------------------

  if (!canRead) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 p-6">
        <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50 to-orange-50 p-5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-red-500 text-white shadow-md">
            <AlertCircle size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-rose-900">Akses Ditolak</h1>
            <p className="mt-1 text-sm text-rose-700">
              Kamu tidak memiliki izin untuk melihat halaman manajemen pengguna.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Main page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/50">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Page header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <Sparkles size={12} className="text-indigo-400" />
              <span>Pengaturan</span>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600">Manajemen Role</span>
            </div>

            <h1 className="mt-2 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Manajemen Role
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Kelola role, pengguna, dan hak akses dalam satu halaman.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SecondaryButton
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              aria-label="Muat ulang data"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </SecondaryButton>

            {canAdd && (
              <AddButton
                type="button"
                onClick={addRole}
                aria-label="Tambah role"
              >
                <Plus size={16} />
              </AddButton>
            )}
          </div>
        </header>

        {renderNotice()}

        {loading && roles.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-12 text-center text-sm text-slate-500 shadow-sm backdrop-blur">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
            Memuat data manajemen role...
          </div>
        ) : (
          <>
            {/* ==========================================
                PARENT: ROLE
            ========================================== */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]">
              <div className="relative overflow-hidden border-b border-slate-100 bg-linear-to-br from-indigo-100 to-violet-100 px-5 py-5 md:px-6">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-linear-to-br from-indigo-200/40 to-violet-200/40 blur-2xl" />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                      <Shield size={22} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-slate-900">
                        Informasi Role
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Pilih role untuk mengelola pengguna dan hak aksesnya.
                      </p>
                    </div>
                  </div>
                  {selectedRole && (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedRole.id === 0 ? (
                        <SecondaryButton
                          type="button"
                          onClick={cancelNewRole}
                          disabled={savingRole}
                          aria-label="Batal"
                        >
                          <X size={16} />
                        </SecondaryButton>
                      ) : (
                        <DeleteButton
                          type="button"
                          onClick={() => void deleteSelectedRole()}
                          disabled={
                            !canDelete || deletingKey === selectedRole._key
                          }
                          aria-label="Hapus role"
                        >
                          <Trash2 size={16} />
                        </DeleteButton>
                      )}
                      <EditButton
                        type="button"
                        onClick={() => void saveRole()}
                        disabled={
                          savingRole ||
                          (selectedRole.id > 0 ? !canEdit : !canAdd)
                        }
                        aria-label="Simpan role"
                      >
                        <Save size={16} />
                      </EditButton>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                {selectedRole ? (
                  <>
                    {/* Parent form */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                      <div className="lg:col-span-5">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Nama Role <span className="text-rose-500">*</span>
                        </label>

                        <input
                          className={inputClass}
                          value={selectedRole.name}
                          onChange={(event) =>
                            updateSelectedRole("name", event.target.value)
                          }
                          placeholder="Contoh: Administrator"
                          disabled={selectedRole.id > 0 ? !canEdit : !canAdd}
                        />
                      </div>

                      <div className="lg:col-span-5">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Deskripsi
                        </label>

                        <input
                          className={inputClass}
                          value={selectedRole.description ?? ""}
                          onChange={(event) =>
                            updateSelectedRole(
                              "description",
                              event.target.value
                            )
                          }
                          placeholder="Deskripsi role"
                          disabled={selectedRole.id > 0 ? !canEdit : !canAdd}
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Status
                        </label>

                        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl ">
                          <input
                            type="checkbox"
                            checked={selectedRole.isActive}
                            onChange={(event) =>
                              updateSelectedRole(
                                "isActive",
                                event.target.checked
                              )
                            }
                            disabled={selectedRole.id > 0 ? !canEdit : !canAdd}
                            className="h-4 w-4 accent-indigo-600"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            Aktif
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Parent actions and navigation */}
                    <div className="mx-auto w-fit border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2">
                        <SecondaryButton
                          type="button"
                          onClick={() => navigateRole(-1)}
                          disabled={
                            selectedRoleIndex <= 0 || selectedRole.id === 0
                          }
                          aria-label="Role sebelumnya"
                        >
                          <ChevronLeft size={16} />
                        </SecondaryButton>

                        <span className="min-w-24 text-center text-xs font-semibold text-slate-600">
                          {selectedRole.id === 0
                            ? "Role baru"
                            : `${selectedRoleIndex + 1} / ${roles.length}`}
                        </span>

                        <SecondaryButton
                          type="button"
                          onClick={() => navigateRole(1)}
                          disabled={
                            selectedRoleIndex < 0 ||
                            selectedRoleIndex >= roles.length - 1 ||
                            selectedRole.id === 0
                          }
                          aria-label="Role berikutnya"
                        >
                          <ChevronRight size={16} />
                        </SecondaryButton>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-violet-100 text-indigo-500">
                      <Shield size={22} />
                    </div>
                    <p className="mt-3 font-semibold text-slate-800">
                      Belum ada role.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Tambahkan role untuk mulai mengelola pengguna dan hak
                      akses.
                    </p>
                    {canAdd && (
                      <div className="mt-4 flex justify-center">
                        <AddButton
                          type="button"
                          onClick={addRole}
                          aria-label="Tambah role"
                        >
                          <Plus size={16} />
                        </AddButton>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ========================================
                  CHILD AREA
              ======================================== */}
              <div className="border-t border-slate-200 bg-linear-to-b from-slate-50 to-white">
                {!selectedRole || selectedRole.id <= 0 ? (
                  <div className="m-5 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center">
                    <p className="font-semibold text-slate-800">
                      Simpan role terlebih dahulu
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Setelah role tersimpan, kamu dapat menambahkan pengguna
                      dan mengatur hak akses fiturnya.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* CHILD 1: USERS */}
                    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-slate-100 bg-linear-to-r from-emerald-100  to-teal-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                        {renderSectionHeading(
                          "Pengguna",
                          `Daftar pengguna dengan role ${selectedRole.name}.`,
                          UserRound,
                          "emerald"
                        )}

                        {canAdd && (
                          <AddButton
                            type="button"
                            onClick={addUser}
                            aria-label="Tambah pengguna"
                          >
                            <Plus size={16} />
                          </AddButton>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-225 border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="w-12 px-4 py-3 text-right">#</th>
                              <th className="px-4 py-3">Nama</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Password</th>
                              <th className="w-24 px-4 py-3 text-center">
                                Aktif
                              </th>
                              <th className="w-32 px-4 py-3 text-right">
                                Aksi
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {roleUsers.map((row, index) => {
                              const editable = row.id > 0 ? canEdit : canAdd;

                              return (
                                <tr
                                  key={row._key}
                                  className="transition-colors hover:bg-emerald-50/40"
                                >
                                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-400">
                                    {index + 1}
                                  </td>

                                  <td className="px-4 py-3">
                                    <input
                                      className={inputClass}
                                      value={row.name}
                                      onChange={(event) =>
                                        updateUser(
                                          row._key,
                                          "name",
                                          event.target.value
                                        )
                                      }
                                      placeholder="Nama pengguna"
                                      disabled={!editable}
                                    />
                                  </td>

                                  <td className="px-4 py-3">
                                    <input
                                      type="email"
                                      className={inputClass}
                                      value={row.email}
                                      onChange={(event) =>
                                        updateUser(
                                          row._key,
                                          "email",
                                          event.target.value
                                        )
                                      }
                                      placeholder="email@contoh.com"
                                      disabled={!editable}
                                    />
                                  </td>

                                  <td className="px-4 py-3">
                                    <input
                                      type="password"
                                      autoComplete="new-password"
                                      className={inputClass}
                                      value={row.password ?? ""}
                                      onChange={(event) =>
                                        updateUser(
                                          row._key,
                                          "password",
                                          event.target.value
                                        )
                                      }
                                      placeholder={
                                        row.id > 0
                                          ? "Kosongkan jika tidak diubah"
                                          : "Password baru"
                                      }
                                      disabled={!editable}
                                    />
                                  </td>

                                  <td className="px-4 py-3 text-center">
                                    {renderCheckbox(
                                      row.isActive,
                                      (value) =>
                                        updateUser(row._key, "isActive", value),
                                      !editable,
                                      `Status aktif ${row.name}`
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                      <EditButton
                                        type="button"
                                        onClick={() => void saveUser(row)}
                                        disabled={
                                          !editable ||
                                          savingKey === row._key ||
                                          deletingKey === row._key
                                        }
                                        aria-label="Simpan pengguna"
                                      >
                                        <Save size={16} />
                                      </EditButton>
                                      {row.id === 0 ? (
                                        <SecondaryButton
                                          type="button"
                                          onClick={() => cancelNewUser(row)}
                                          disabled={savingKey === row._key}
                                          aria-label="Batal"
                                        >
                                          <X size={16} />
                                        </SecondaryButton>
                                      ) : (
                                        <DeleteButton
                                          type="button"
                                          onClick={() => void deleteUser(row)}
                                          disabled={
                                            !canDelete ||
                                            deletingKey === row._key
                                          }
                                          title="Hapus pengguna"
                                          aria-label="Hapus pengguna"
                                        >
                                          <Trash2 size={16} />
                                        </DeleteButton>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {roleUsers.length === 0 &&
                          renderEmpty(
                            "Belum ada pengguna pada role ini. Klik Tambah Pengguna untuk memulai."
                          )}
                      </div>

                      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
                        <AlertCircle size={12} className="shrink-0" />
                        Pengguna baru otomatis menggunakan role yang sedang
                        dipilih. Password pengguna lama tidak ditampilkan.
                      </div>
                    </section>

                    {/* CHILD 2: FEATURES & PERMISSIONS */}
                    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-slate-100 bg-linear-to-r from-amber-100 to-orange-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                        {renderSectionHeading(
                          "Fitur & Hak Akses",
                          `Atur izin Lihat, Tambah, Ubah, dan Hapus untuk role ${selectedRole.name}.`,
                          Layers,
                          "amber"
                        )}

                        {canAdd && (
                          <AddButton
                            type="button"
                            onClick={openFeatureModal}
                            aria-label="Tambah fitur"
                          >
                            <Plus size={16} />
                          </AddButton>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-212.5 border-collapse text-sm">
                          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="w-12 px-4 py-3 text-right">#</th>
                              <th className="px-4 py-3 text-left">Fitur</th>
                              {ACTIONS.map((action) => (
                                <th
                                  key={action.key}
                                  className="w-24 px-3 py-3 text-center"
                                >
                                  {action.label}
                                </th>
                              ))}
                              <th className="w-32 px-4 py-3 text-right">
                                Aksi
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {rolePermissions.map((row, index) => {
                              const feature = features.find(
                                (item) => item.id === row.featureId
                              );

                              if (!feature) return null;

                              const available = getAvailableActions(feature);

                              return (
                                <tr
                                  key={row._key}
                                  className="transition-colors hover:bg-amber-50/40"
                                >
                                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-400">
                                    {index + 1}
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-slate-800">
                                      {feature.name}
                                    </div>
                                    <div className="mt-1 inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                      {feature.code}
                                    </div>
                                  </td>

                                  {ACTIONS.map((action) => {
                                    const availableAction = available.includes(
                                      action.code
                                    );

                                    return (
                                      <td
                                        key={action.key}
                                        className="px-3 py-3 text-center"
                                      >
                                        {availableAction ? (
                                          renderCheckbox(
                                            row[action.key],
                                            (value) =>
                                              updatePermission(
                                                row._key,
                                                action.key,
                                                value
                                              ),
                                            !canEdit,
                                            `${action.label} ${feature.name}`
                                          )
                                        ) : (
                                          <span
                                            className="text-slate-300"
                                            title={`Aksi ${action.label} tidak tersedia untuk fitur ini`}
                                          >
                                            —
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}

                                  <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                      <EditButton
                                        type="button"
                                        onClick={() => void savePermission(row)}
                                        disabled={
                                          !canEdit ||
                                          savingKey === row._key ||
                                          deletingKey === row._key
                                        }
                                        aria-label="Simpan hak akses"
                                      >
                                        <Save size={16} />
                                      </EditButton>
                                      <DeleteButton
                                        type="button"
                                        onClick={() =>
                                          void deletePermission(row)
                                        }
                                        disabled={
                                          !canDelete || deletingKey === row._key
                                        }
                                        title="Hapus pengaturan hak akses untuk role ini"
                                        aria-label="Hapus hak akses"
                                      >
                                        <Trash2 size={16} />
                                      </DeleteButton>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {rolePermissions.length === 0 &&
                          renderEmpty(
                            "Belum ada pengaturan hak akses untuk role ini."
                          )}
                      </div>

                      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle size={12} className="shrink-0" />
                          Centang aksi yang diizinkan untuk role ini, lalu tekan
                          Simpan pada baris terkait.
                        </span>
                        <span>— = aksi tidak tersedia pada fitur.</span>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* ================================================
          MODAL: ADD FEATURE
      ================================================ */}
      {showFeatureModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowFeatureModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-feature-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)]"
          >
            <div className="relative overflow-hidden border-b border-slate-100 bg-linear-to-br from-indigo-50 via-white to-violet-50 px-5 py-5">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-linear-to-br from-indigo-200/50 to-violet-200/50 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2
                      id="add-feature-title"
                      className="text-lg font-bold tracking-tight text-slate-900"
                    >
                      Tambah Fitur
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Fitur baru akan tersedia untuk seluruh role.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Nama Fitur <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  className={inputClass}
                  value={featureForm.name}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Manajemen Produk"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Kode Fitur <span className="text-rose-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={featureForm.code}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Contoh: PRODUCT_MANAGEMENT"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Gunakan huruf, angka, garis bawah, atau tanda hubung.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Deskripsi
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={featureForm.description}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Deskripsi singkat fitur"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Aksi yang Tersedia
                </label>
                <select
                  className={inputClass}
                  value={featureForm.availableActions}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      availableActions: event.target.value,
                    }))
                  }
                >
                  <option value="r">Lihat</option>
                  <option value="r,a">Lihat, Tambah</option>
                  <option value="r,a,e">Lihat, Tambah, Ubah</option>
                  <option value="r,a,e,d">Lihat, Tambah, Ubah, Hapus</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-white p-3.5 shadow-sm transition hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={featureForm.isActive}
                  onChange={(event) =>
                    setFeatureForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  Aktifkan fitur
                </span>
              </label>

              <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50 to-violet-50 px-3.5 py-3 text-xs leading-5 text-indigo-800">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>
                  Setelah disimpan, API akan membuat pengaturan permission untuk
                  semua role dengan aksi Lihat, Tambah, Ubah, dan Hapus dalam
                  keadaan nonaktif. Atur izin role ini pada grid setelah modal
                  ditutup.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <SecondaryButton
                type="button"
                onClick={() => setShowFeatureModal(false)}
                disabled={savingFeature}
                aria-label="Batal"
              >
                <X size={16} />
              </SecondaryButton>
              <AddButton
                type="button"
                onClick={() => void saveFeature()}
                disabled={
                  savingFeature ||
                  !featureForm.name.trim() ||
                  !featureForm.code.trim()
                }
                aria-label="Simpan fitur"
              >
                <Save size={16} />
              </AddButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
