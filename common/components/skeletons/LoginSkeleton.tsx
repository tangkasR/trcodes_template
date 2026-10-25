import Skeleton from "./Skeleton";

export default function LoginSkeleton() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f7f5ef] text-ink"
      role="status"
      aria-label="Memuat halaman login"
    >
      <span className="sr-only">Memuat halaman login...</span>
      <div className="dots absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="hidden lg:block">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-none" tone="ink" />
              <Skeleton className="h-6 w-28" tone="ink" />
            </div>

            <Skeleton className="mt-16 h-3 w-36" tone="ink" />
            <Skeleton className="mt-5 h-14 w-full max-w-xl" tone="ink" />
            <Skeleton className="mt-2 h-14 w-4/5 max-w-lg" tone="ink" />
            <Skeleton className="mt-6 h-4 w-full max-w-md" tone="ink" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-sm" tone="ink" />

            <div className="mt-10 grid max-w-md gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-2 border-ink/20 bg-white px-4 py-3"
                >
                  <Skeleton className="size-7 shrink-0 rounded-none" tone="ink" />
                  <Skeleton className="h-4 w-48 max-w-full" tone="ink" />
                </div>
              ))}
            </div>
          </section>

          <section className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="box bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-16" tone="ink" />
                  <Skeleton className="h-8 w-4/5" tone="ink" />
                  <Skeleton className="h-4 w-full" tone="ink" />
                </div>
                <Skeleton className="size-11 shrink-0 rounded-none" tone="ink" />
              </div>

              <div className="mt-7 space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-14" tone="ink" />
                  <Skeleton className="h-12 w-full rounded-none" tone="ink" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" tone="ink" />
                  <Skeleton className="h-12 w-full rounded-none" tone="ink" />
                </div>
                <Skeleton className="h-12 w-full rounded-none" tone="ink" />
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-3 w-48" tone="ink" />
                <Skeleton className="h-3 w-32" tone="ink" />
              </div>
            </div>

            <Skeleton className="mx-auto mt-4 h-3 w-64" tone="ink" />
          </section>
        </div>
      </div>
    </div>
  );
}
