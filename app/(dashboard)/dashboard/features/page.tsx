import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import FeaturesPage from "@/modules/dashboard/feature/pages/FeaturePage";

export const instant = false;

export default function page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <FeaturesPage />
    </Suspense>
  );
}
