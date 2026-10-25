import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import SecurityPage from "@/modules/dashboard/security/pages/SecurityPage";

export const instant = false;

export default function page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <SecurityPage />
    </Suspense>
  );
}
