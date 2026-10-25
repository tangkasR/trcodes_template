import { ScrollText } from "lucide-react";
import PageHeader from "@/common/components/PageHeader";
import { requirePageAccess } from "@/common/lib/auth";
import AuditLogTable from "../components/AuditLogTable";

export default async function AuditLogPage() {
  await requirePageAccess("audit-log", "read");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Audit Log"
        description="Jejak aktivitas keamanan: login, perubahan user, role, dan hak akses."
        eyebrow="Keamanan"
      />
      <AuditLogTable />
    </div>
  );
}
