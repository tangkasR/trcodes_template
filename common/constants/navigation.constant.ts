import {
  Boxes,
  KeyRound,
  LayoutDashboard,
  Package,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FeatureKey } from "./rbac.constant";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  feature?: FeatureKey; // kosong = semua user login boleh melihat
};

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Profil Saya",
        href: "/dashboard/profile",
        icon: User,
      },
      {
        label: "Keamanan Akun",
        href: "/dashboard/security",
        icon: KeyRound,
      },
    ],
  },
  {
    label: "Master Data",
    items: [
      {
        label: "Data Item",
        href: "/dashboard/items",
        icon: Package,
        feature: "item",
      },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { label: "Akun Pengguna", href: "/dashboard/users", icon: Users, feature: "user" },
      {
        label: "Hak Akses",
        href: "/dashboard/roles",
        icon: ShieldCheck,
        feature: "role",
      },
      { label: "Fitur", href: "/dashboard/features", icon: Boxes, feature: "feature" },
      {
        label: "Log Login",
        href: "/dashboard/login-attempts",
        icon: ShieldAlert,
        feature: "login-attempt",
      },
      {
        label: "Audit Log",
        href: "/dashboard/audit-logs",
        icon: ScrollText,
        feature: "audit-log",
      },
    ],
  },
];
