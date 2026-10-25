import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginSkeleton from "@/common/components/skeletons/LoginSkeleton";
import LoginPage from "@/modules/public/auth/pages/LoginPage";
import { getSession } from "@/common/lib/auth";

export const instant = false;

async function LoginWrapper() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return <LoginPage />;
}

export default function Page() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginWrapper />
    </Suspense>
  );
}
