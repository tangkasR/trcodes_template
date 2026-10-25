import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { ACTIONS, FEATURES, ROLE_SUPER_ADMIN, ROLE_DEFAULT } from "../common/constants/rbac.constant";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("Menyelaraskan fitur sistem & hak akses...");

  const superAdminRole = await prisma.role.findFirst({
    where: { name: ROLE_SUPER_ADMIN },
  });

  const defaultRole = await prisma.role.findFirst({
    where: { name: ROLE_DEFAULT },
  });

  if (!superAdminRole) {
    console.warn("Role Super Admin tidak ditemukan. Jalankan seed terlebih dahulu.");
    return;
  }

  for (const f of FEATURES) {
    let feat = await prisma.feature.findUnique({
      where: { key: f.key },
    });

    if (!feat) {
      feat = await prisma.feature.create({
        data: {
          key: f.key,
          name: f.name,
          desc: f.desc,
          availableActions: [...ACTIONS],
        },
      });
      console.log(`+ Fitur baru dibuat: ${f.name} (${f.key})`);
    }

    // Pastikan Super Admin memiliki permission penuh
    const saPerm = await prisma.rolePermission.findFirst({
      where: {
        roleUuid: superAdminRole.uuid,
        featureUuid: feat.uuid,
      },
    });

    if (!saPerm) {
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
      console.log(`+ Hak akses Super Admin diberikan untuk: ${f.name}`);
    }

    // Pastikan Default Role memiliki permission record
    if (defaultRole) {
      const defPerm = await prisma.rolePermission.findFirst({
        where: {
          roleUuid: defaultRole.uuid,
          featureUuid: feat.uuid,
        },
      });

      if (!defPerm) {
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
    }
  }

  // Jika tabel items kosong, isi dengan data awal
  const itemCount = await prisma.item.count();
  if (itemCount === 0) {
    await prisma.item.createMany({
      data: [
        {
          name: "Item Template Standar A",
          description: "Contoh data master pertama untuk pengujian fitur CRUD dan RBAC.",
          sortOrder: 1,
          isActive: true,
        },
        {
          name: "Item Template Standar B",
          description: "Contoh data master kedua untuk validasi paginasi tabel dan pencarian.",
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
    console.log("+ Contoh data item berhasil dibuat");
  }

  console.log("Penyelarasan fitur & hak akses selesai!");
}

main()
  .catch((e) => {
    console.error("Gagal menyelaraskan fitur:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
