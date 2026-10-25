import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  SEO_KEYWORDS,
  SITE_NAME,
} from "@/common/constants/app.constant";
import { getSiteUrl } from "@/common/utils/site";
import "./globals.css";
import "sweetalert2/dist/sweetalert2.css";
import Providers from "./providers";

// CSP nonce dibuat per request di proxy.ts
export const instant = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: "%s | trcodes Enterprise",
  },
  description: DEFAULT_SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [
    { name: "Tangkas Risdianto", url: getSiteUrl() },
    { name: "tangkas risdianto", url: getSiteUrl() },
  ],
  creator: "Tangkas Risdianto",
  publisher: "Tangkas Risdianto (trcodes.dev)",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: `${SITE_NAME} — Tangkas Risdianto | Full Stack Developer`,
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    creator: "@trcodes",
  },
  icons: {
    icon: [
      { url: "/imglogo.png", type: "image/png" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/imglogo.png", type: "image/png" },
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
