import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import UsersPage from "@/modules/dashboard/user/pages/UserPage";

export const instant = false;

export default function page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <UsersPage />
    </Suspense>
  );
}
