import { Suspense } from "react";
import type { Metadata } from "next";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import ForbiddenPage from "@/modules/dashboard/forbidden/pages/ForbiddenPage";

export const metadata: Metadata = { title: "Akses ditolak" };
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <ForbiddenPage />
    </Suspense>
  );
}
