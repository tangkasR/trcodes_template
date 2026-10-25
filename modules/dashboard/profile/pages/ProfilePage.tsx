// src/modules/dashboard/profile/pages/ProfilePage.tsx
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import PageHeader from "@/common/components/PageHeader";
import { getSession } from "@/common/lib/auth";
import { getProfile } from "../profile.queries";
import ProfileForm from "../components/ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getProfile(session.userUuid);
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={User}
        title="Profil Saya"
        description="Kelola data akun, informasi kontak, dan foto profil Anda."
        eyebrow="Akun"
      />

      <ProfileForm initialData={profile} />
    </div>
  );
}
