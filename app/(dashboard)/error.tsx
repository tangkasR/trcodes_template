// src/app/(dashboard)/error.tsx   (error di dalam halaman: sidebar tetap tampil)
"use client";

import ErrorView from "@/common/components/DashboardError";

export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView {...props} />;
}
