"use cache";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { io } from "next/cache";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = async () => {
  await io();
  const productLinks = [
    { name: "Fitur", href: "#features" },
    { name: "Harga", href: "#pricing" },
    { name: "Pembaruan", href: "#changelog" },
  ];

  const companyLinks = [
    { name: "Tentang Kami", href: "#about" },
    { name: "Kontak", href: "#contact" },
    { name: "Berita", href: "#blog" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                Logo
              </div>

              <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Produk Anda
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Deskripsi web anda
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-2">
              <Link
                href="#github"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <FaGithub size={17} />
              </Link>

              <Link
                href="#linkedin"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <FaLinkedinIn size={17} />
              </Link>

              <Link
                href="#instagram"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <FaInstagram size={17} />
              </Link>

              <Link
                href="#twitter"
                aria-label="X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <FaXTwitter size={17} />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="flex justify-center w-full">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                Produk
              </h3>

              <ul className="mt-4 space-y-3">
                {productLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company */}
          <div className="flex justify-center w-full">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                Perusahaan
              </h3>

              <ul className="mt-4 space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-slate-200 py-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} produk anda.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="#privacy"
              className="text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Kebijakan Privasi
            </Link>

            <Link
              href="#terms"
              className="text-sm text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Syarat dan Ketentuan Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
