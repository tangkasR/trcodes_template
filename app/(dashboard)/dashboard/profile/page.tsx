import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import ProfilePage from "@/modules/dashboard/profile/pages/ProfilePage";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}
