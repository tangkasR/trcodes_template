import Skeleton from "./Skeleton";

export default function PublicPageSkeleton() {
  return (
    <div
      className="bg-paper text-ink"
      role="status"
      aria-label="Memuat halaman"
    >
      <span className="sr-only">Memuat halaman...</span>

      <header className="border-b-2 border-ink bg-paper">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-10">
          <Skeleton className="h-5 w-28" tone="ink" />
          <div className="flex items-center gap-5">
            <Skeleton className="h-4 w-16" tone="ink" />
            <Skeleton className="h-4 w-24" tone="ink" />
          </div>
        </div>
      </header>

      <main className="min-h-screen mx-auto max-w-5xl px-5 py-14 md:px-10 md:py-20">
        <Skeleton className="h-3 w-24" tone="ink" />
        <Skeleton className="mt-5 h-12 w-4/5 sm:h-16" tone="ink" />
        <Skeleton className="mt-4 h-5 w-3/5" tone="ink" />
        <Skeleton className="mt-2 h-5 w-2/5" tone="ink" />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="border-2 border-ink/20 bg-white p-5 shadow-[0_0_0_0_transparent]"
            >
              <Skeleton className="h-3 w-16" tone="ink" />
              <Skeleton className="mt-4 h-6 w-4/5" tone="ink" />
              <Skeleton className="mt-2 h-4 w-full" tone="ink" />
              <Skeleton className="mt-2 h-4 w-3/4" tone="ink" />
            </div>
          ))}
        </div>

        <div className="mt-14 border-t-2 border-ink/10 pt-8">
          <Skeleton className="h-6 w-48" tone="ink" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full" tone="ink" />
            <Skeleton className="h-4 w-11/12" tone="ink" />
            <Skeleton className="h-4 w-4/5" tone="ink" />
          </div>
        </div>
      </main>

      <footer className="bg-ink px-5 py-16 text-paper md:px-10">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Skeleton className="h-7 w-32" tone="white" />
            <Skeleton className="mt-4 h-4 w-full" tone="white" />
            <Skeleton className="mt-2 h-4 w-3/4" tone="white" />
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-5 w-20" tone="white" />
            <Skeleton className="mt-4 h-4 w-24" tone="white" />
            <Skeleton className="mt-2 h-4 w-28" tone="white" />
          </div>
          <div className="md:col-span-5">
            <Skeleton className="h-5 w-40" tone="white" />
            <Skeleton className="mt-4 h-4 w-full" tone="white" />
            <Skeleton className="mt-2 h-4 w-5/6" tone="white" />
            <Skeleton className="mt-2 h-4 w-2/3" tone="white" />
          </div>
        </div>
      </footer>
    </div>
  );
}
