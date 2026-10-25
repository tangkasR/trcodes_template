import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import LoginAttemptPage from "@/modules/dashboard/login-attempt/pages/LoginAttemptPage";

export const instant = false;

export default function page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <LoginAttemptPage />
    </Suspense>
  );
}
