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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://devoice-two.vercel.app"
  ),
  title: "Jonathan - De Voice",
  description:
    "Official website of Ugandan soul singer Kigula Jonathan Sedrak, popularly known as De Voice and Da Diva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[var(--off-white)] text-[var(--text)] antialiased">
        <MediaManager />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}