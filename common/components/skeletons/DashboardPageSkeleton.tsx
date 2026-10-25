import Skeleton from "./Skeleton";

export default function DashboardPageSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Memuat halaman dashboard"
    >
      <span className="sr-only">Memuat halaman...</span>

      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <Skeleton className="size-12 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-56 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full rounded-xl sm:max-w-sm" />
        <Skeleton className="h-10 w-full rounded-xl sm:w-36" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3.5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-3 w-full max-w-24" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} className="grid grid-cols-4 gap-4 px-4 py-4">
              {Array.from({ length: 4 }, (_, col) => (
                <Skeleton
                  key={col}
                  className={`h-4 ${col === 0 ? "w-24" : "w-full max-w-32"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-1.5">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
