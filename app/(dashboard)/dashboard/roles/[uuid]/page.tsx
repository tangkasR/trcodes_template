import { Suspense } from "react";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import RolePermissionsPage from "@/modules/dashboard/role-permission/pages/RolePermissionPage";

type Props = { params: Promise<{ uuid: string }> };

export const instant = false;

export default function page({ params }: Props) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <RolePermissionsPage params={params} />
    </Suspense>
  );
}
