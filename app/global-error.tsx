"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <head>
        {/* global-error menggantikan root layout, jadi CSS aplikasi tidak ikut
            dimuat dan style inline diblokir CSP. Pakai stylesheet statis. */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- global-error tidak mewarisi CSS aplikasi */}
        <link rel="stylesheet" href="/global-error.css" />
      </head>
      <body className="ge-body">
        <div className="ge-content">
          <h1>Terjadi kesalahan</h1>
          <p>Aplikasi mengalami masalah. Silakan coba lagi.</p>
          <button type="button" onClick={() => reset()}>
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
