// src/app/(dashboard)/roles/[id]/permissions/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import PageHeader from "@/common/components/PageHeader";
import { requirePageAccess } from "@/common/lib/auth";
import { ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import { uuidSchema } from "@/common/utils/zod";
import { getRolePermissionMatrix } from "@/modules/dashboard/role-permission/role-permission.queries";
import PermissionMatrix from "@/modules/dashboard/role-permission/components/PermissionMatrix";

type Props = { params: Promise<{ uuid: string }> };

export default async function RolePermissionsPage({ params }: Props) {
  const session = await requirePageAccess("role-permission", "read");

  const { uuid } = await params;
  if (!uuidSchema.safeParse(uuid).success) notFound(); // bukan UUID: jangan sampai ke query

  const data = await getRolePermissionMatrix(uuid);
  if (!data) notFound();

  const isSuperAdmin = session.roleName === ROLE_SUPER_ADMIN;
  const locked =
    !isSuperAdmin &&
    (data.role.isSuperAdmin || session.roleUuid === data.role.uuid);
  const lockedMessage = data.role.isSuperAdmin
    ? "Hanya Super Admin yang dapat mengubah hak akses role Super Admin."
    : "Kamu tidak dapat mengubah hak akses role yang sedang kamu pakai.";

  // berubah saat data di server berubah → komponen dibuat ulang dengan baseline baru
  const signature = data.features
    .map(
      (f) => `${f.uuid}|${f.availableActions.join(",")}|${f.granted.join(",")}`
    )
    .join(";");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/roles"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Peran
        </Link>
        <PageHeader
          icon={KeyRound}
          title={`Hak akses peran: ${data.role.name}`}
          description={
            data.role.desc ||
            "Atur fitur dan aksi yang boleh diakses oleh peran ini."
          }
          eyebrow="Keamanan"
        />
      </div>

      <PermissionMatrix
        key={signature}
        roleUuid={data.role.uuid}
        features={data.features}
        isOwnRole={session.roleUuid === data.role.uuid}
        locked={locked}
        lockedMessage={lockedMessage}
      />
    </div>
  );
}
