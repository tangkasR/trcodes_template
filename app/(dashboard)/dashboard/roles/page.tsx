import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import RolesPage from "@/modules/dashboard/role/pages/RolePage";

export const instant = false;

export default function page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <RolesPage />
    </Suspense>
  );
}
