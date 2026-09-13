import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import MediaManager from "@/components/layout/MediaManager";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jonathan - De Voice",
  description:
    "Official website of Ugandan soul singer Kigula Jonathan Sedrak, popularly known as De Voice and Da Diva.",
  openGraph: {
    title: "Jonathan - De Voice",
    description:
      "Official website of Ugandan soul singer Kigula Jonathan Sedrak, popularly known as De Voice and Da Diva.",
    url: "https://jonathankigula.com",
    siteName: "Jonathan - De Voice",
    images: [
      {
        url: "https://jonathankigula.com/hero.jpeg",
        width: 1200,
        height: 630,
        alt: "Jonathan Kigula - De Voice",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonathan - De Voice",
    description:
      "Official website of Ugandan soul singer Kigula Jonathan Sedrak, popularly known as De Voice and Da Diva.",
    images: ["https://jonathankigula.com/hero.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-[var(--off-white)] text-[var(--text)] antialiased">
        <MediaManager />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}