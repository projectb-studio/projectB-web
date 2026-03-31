import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "@/styles/globals.css";
import { SITE_CONFIG } from "@/constants/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Pretendard loaded via CSS @import (variable font, subset)
// If you prefer next/font/local, download and place in /public/fonts/

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={archivo.variable}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
