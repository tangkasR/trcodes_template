import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import DashboardPage from "@/modules/dashboard/dashboard/pages/DashboardPage";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
