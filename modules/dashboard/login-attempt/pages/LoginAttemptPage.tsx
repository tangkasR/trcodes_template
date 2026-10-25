// src/modules/login-attempt/pages/LoginAttemptPage.tsx
import { History } from "lucide-react";
import PageHeader from "@/common/components/PageHeader";
import { requirePageAccess } from "@/common/lib/auth";
import LoginAttemptTable from "../components/LoginAttemptTable";

export default async function LoginAttemptPage() {
  await requirePageAccess("login-attempt", "read");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={History}
        title="Log Percobaan Login"
        description="Audit trail riwayat percobaan autentikasi dan upaya masuk ke sistem."
        eyebrow="Keamanan"
      />
      <LoginAttemptTable />
    </div>
  );
}
