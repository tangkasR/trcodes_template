import { Home, Users, Settings, Package } from "lucide-react";

export const mainNavigation = [
  {
    name: "Beranda",
    href: "/dashboard",
    icon: Home,
    desc: "Selamat datang di produk anda!",
  },
  {
    name: "Produk",
    href: "/dashboard/products",
    icon: Package,
    desc: "Kelola nama, harga, stok, dan status produk.",
  },
];

export const managementNavigation = [
  {
    name: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    desc: "Kelola role, pengguna, dan hak akses dalam satu halaman.",
  },
  {
    name: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
