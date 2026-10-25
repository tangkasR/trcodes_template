import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import ItemPage from "@/modules/dashboard/item/pages/ItemPage";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <ItemPage />
    </Suspense>
  );
}
