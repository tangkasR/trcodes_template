import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-center">
      <div>
        <p className="text-5xl font-semibold text-gray-300">404</p>
        <h1 className="mt-3 text-xl font-semibold text-gray-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Alamat yang kamu buka tidak ada.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
