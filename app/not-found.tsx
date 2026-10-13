import Link from "next/link";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <body>
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="w-full max-w-xl text-center">
          <div className="mb-6">
            <span className="text-8xl font-black tracking-tight text-slate-200 dark:text-slate-800 sm:text-9xl">
              404
            </span>
          </div>

          <div className="-mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Page not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Sorry, the page you are looking for doesn&apos;t exist or may have
              been moved.
            </p>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="text-sm font-bold tracking-tight text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            >
              Produk Anda
            </Link>
          </div>
        </div>
      </main>
    </body>
  );
};

export default NotFound;
