import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginSkeleton from "@/common/components/skeletons/LoginSkeleton";
import MfaPage from "@/modules/public/auth/pages/MfaPage";
import { getSession, readMfaChallenge } from "@/common/lib/auth";

async function MfaChallengePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const challenge = await readMfaChallenge();
  if (!challenge) redirect("/login");

  return <MfaPage email={challenge.email} />;
}

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <MfaChallengePage />
    </Suspense>
  );
}
