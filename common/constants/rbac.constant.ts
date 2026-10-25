export const ACTIONS = ["read", "add", "edit", "delete"] as const;
export type Action = (typeof ACTIONS)[number];
export type PermissionMap = Record<string, Action[]>;

export const ACTION_COLUMN = {
  read: "isRead",
  add: "isAdd",
  edit: "isEdit",
  delete: "isDelete",
} as const;

export const ACTION_LABEL: Record<Action, string> = {
  read: "Read",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
};

export const ROLE_SUPER_ADMIN = "Super Admin";
export const ROLE_DEFAULT = "User";

export const PROTECTED_ROLE_NAMES: readonly string[] = [
  ROLE_SUPER_ADMIN,
  ROLE_DEFAULT,
];

export const FEATURES = [
  { key: "user", name: "Pengguna", desc: "Kelola akun dan status pengguna sistem" },
  { key: "role", name: "Peran", desc: "Kelola peran dan wewenang pengguna" },
  { key: "feature", name: "Fitur Sistem", desc: "Kelola registri modul dan fitur sistem" },
  { key: "role-permission", name: "Hak Akses", desc: "Kelola matriks izin per peran dan fitur" },
  { key: "item", name: "Master Data Item", desc: "Kelola data item contoh referensi CRUD" },
  { key: "login-attempt", name: "Log Percobaan Login", desc: "Pantau riwayat percobaan login" },
  { key: "audit-log", name: "Jejak Audit Keamanan", desc: "Lihat jejak aktivitas dan audit log sistem" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];
export const SYSTEM_FEATURE_KEYS: readonly string[] = FEATURES.map((f) => f.key);
