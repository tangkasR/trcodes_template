import PrimaryButton from "@/components/button/PrimaryButton";
import SecondaryButton from "@/components/button/SecondaryButton";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Hero Section */}
      <section
        id="home"
        className="flex min-h-screen items-center justify-center px-4 pt-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Produk Anda
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-7xl dark:text-white">
            Deskripsikan produk
            <span className="block text-slate-500 dark:text-slate-400">
              anda.
            </span>
          </h1>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton>
              <Link href={"#features"}>Daftar Fitur</Link>
            </PrimaryButton>
            <SecondaryButton>
              <Link href={"#about"}>Penjelasan Lengkap</Link>
            </SecondaryButton>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-slate-200 px-4 py-24 sm:px-6 lg:px-8 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Fitur
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Buat fitur web anda
            </h2>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-slate-200 px-4 py-24 sm:px-6 lg:px-8 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Tentang Web Anda
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Deskripsikan web anda
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
