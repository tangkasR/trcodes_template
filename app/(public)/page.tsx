import { Suspense } from "react";
import PublicPageSkeleton from "@/common/components/skeletons/PublicPageSkeleton";
import HomePage from "@/modules/public/home/pages/HomePage";

// The portfolio content is read live from PostgreSQL.
export const instant = false;

export default function Home() {
  return (
    <Suspense fallback={<PublicPageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}
