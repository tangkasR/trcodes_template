"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 font-display text-lg font-black tracking-tight transition hover:opacity-90"
        >
          <span className="flex size-9 items-center justify-center rounded-xl border-2 border-ink bg-white p-1.5 shadow-[2px_2px_0px_#1b1a17] transition-transform group-hover:-translate-y-0.5">
            <Image
              src="/imglogo.png"
              alt="Logo"
              width={28}
              height={28}
              className="size-6 object-contain"
              priority
            />
          </span>
          <span className="flex items-center gap-2">
            <span>trcodes</span>
            <span className="hidden rounded-md border border-ink/20 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 sm:inline">
              Enterprise Starter
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi publik"
          className="hidden items-center gap-6 text-sm font-bold md:flex"
        >
          <Link
            href="/#features"
            className="text-graphite transition hover:text-ink hover:underline hover:underline-offset-4"
          >
            Fitur Utama
          </Link>
          <Link
            href="/#architecture"
            className="text-graphite transition hover:text-ink hover:underline hover:underline-offset-4"
          >
            Arsitektur
          </Link>
          <Link
            href="/#quickstart"
            className="text-graphite transition hover:text-ink hover:underline hover:underline-offset-4"
          >
            Panduan CLI
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 text-xs font-black tracking-wider text-paper uppercase shadow-[3px_3px_0px_#8a8a8a] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#8a8a8a] sm:text-sm"
          >
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Dashboard</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </header>
  );
}
