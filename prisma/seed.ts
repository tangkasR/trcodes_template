import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import {
  ACTIONS,
  FEATURES,
  ROLE_DEFAULT,
  ROLE_SUPER_ADMIN,
} from "../common/constants/rbac.constant";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function getSeedCredentials(): { email: string; password: string } {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  const weakPasswords = new Set([
    "superadmin#123",
    "password#default",
    "password",
    "admin",
    "changeme",
    "change_me_min_12_karakter",
  ]);

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi sebelum menjalankan seed."
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    throw new Error("SEED_ADMIN_EMAIL bukan alamat email yang valid.");
  }
  if (adminPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD minimal 12 karakter.");
  }
  if (weakPasswords.has(adminPassword.toLowerCase())) {
    throw new Error(
      "SEED_ADMIN_PASSWORD masih memakai password default yang lemah."
    );
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DESTRUCTIVE_SEED !== "true"
  ) {
    throw new Error(
      "Seed bersifat destruktif. Set ALLOW_DESTRUCTIVE_SEED=true hanya jika benar-benar ingin mereset data production."
    );
  }

  return { email: adminEmail, password: adminPassword };
}

const ADMIN = getSeedCredentials();

async function main() {
  console.log("Memulai proses seeder starter template...");

  // 0. Reset semua data di tabel inti secara berurutan sesuai relasi FK
  console.log("Membersihkan data lama...");
  await prisma.auditLog.deleteMany();
  await prisma.mfaAttempt.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.rateLimitBucket.deleteMany();
  await prisma.item.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.feature.deleteMany();

  // 1. Seed Roles
  console.log("Seeding roles...");
  const superAdminRole = await prisma.role.create({
    data: {
      name: ROLE_SUPER_ADMIN,
      desc: "Akses penuh ke semua fitur dan modul sistem",
    },
  });

  const defaultRole = await prisma.role.create({
    data: {
      name: ROLE_DEFAULT,
      desc: "Role default untuk user pendaftaran baru",
    },
  });

  // 2. Seed Features
  console.log("Seeding features...");
  const createdFeatures = [];
  for (const f of FEATURES) {
    const feat = await prisma.feature.create({
      data: {
        key: f.key,
        name: f.name,
        desc: f.desc,
        availableActions: [...ACTIONS],
      },
    });
    createdFeatures.push(feat);
  }

  // 3. Seed Role Permissions
  console.log("Seeding role permissions...");
  for (const feat of createdFeatures) {
    // Super Admin: Akses penuh ke SEMUA fitur (read, add, edit, delete)
    await prisma.rolePermission.create({
      data: {
        roleUuid: superAdminRole.uuid,
        featureUuid: feat.uuid,
        isRead: true,
        isAdd: true,
        isEdit: true,
        isDelete: true,
      },
    });

    // Default Role (User): Izin awal false
    await prisma.rolePermission.create({
      data: {
        roleUuid: defaultRole.uuid,
        featureUuid: feat.uuid,
        isRead: false,
        isAdd: false,
        isEdit: false,
        isDelete: false,
      },
    });
  }

  // 4. Seed User Super Admin
  console.log("Seeding super admin user...");
  await prisma.user.create({
    data: {
      name: process.env.SEED_ADMIN_NAME?.trim() || "Super Administrator",
      email: ADMIN.email,
      password: await bcrypt.hash(ADMIN.password, 12),
      roleUuid: superAdminRole.uuid,
      isActive: true,
    },
  });

  // 5. Seed Sample Items (Master Data Starter Reference)
  console.log("Seeding sample items...");
  await prisma.item.createMany({
    data: [
      {
        name: "Server Virtual Private (VPS)",
        description: "Infrastruktur cloud compute untuk deployment aplikasi Docker Next.js 16.",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "Database PostgreSQL Cluster",
        description: "Basis data relasional dengan indeks UUIDv7 dan pooling koneksi tinggi.",
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "Sertifikat SSL / TLS Wildcard",
        description: "Enkripsi HTTPS end-to-end otomatis dengan strict HSTS dan CSP Nonce.",
        sortOrder: 3,
        isActive: true,
      },
      {
        name: "Object Storage CDN",
        description: "Media storage terdistribusi untuk aset gambar profil dan unggahan berkas.",
        sortOrder: 4,
        isActive: true,
      },
      {
        name: "Redis In-Memory Cache",
        description: "Penyimpanan cache terdistribusi dan rate limiter atomic bucket.",
        sortOrder: 5,
        isActive: true,
      },
      {
        name: "Domain & DNS Resolver",
        description: "Manajemen konfigurasi DNS record A, AAAA, dan CAA security.",
        sortOrder: 6,
        isActive: false,
      },
    ],
  });

  console.log("=====================================");
  console.log("Seeder berhasil dijalankan sepenuhnya!");
  console.log(`Akun Super Admin : ${ADMIN.email}`);
  console.log("Password         : sesuai SEED_ADMIN_PASSWORD (tidak ditampilkan)");
  console.log("=====================================");
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seeder:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
