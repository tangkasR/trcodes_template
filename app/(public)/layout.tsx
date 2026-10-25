import { Newsreader, Syne } from "next/font/google";
import "../globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal"],
  variable: "--font-newsreader",
  display: "swap",
});

const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-newsreader-italic",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

// Public pages read live portfolio data from PostgreSQL. Let them block on the
// server instead of trying to prerender a shell without that data.
export const instant = false;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-paper text-ink ${newsreader.variable} ${newsreaderItalic.variable} ${syne.variable}`}
    >
      {children}
    </div>
  );
}
