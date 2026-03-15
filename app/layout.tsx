import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import Navigation from "@/components/Navigation";
import { CurrencyProvider } from "@/lib/context/CurrencyContext";
import I18nProvider from "@/components/I18nProvider";
import LanguageBar from "@/components/LanguageBar";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hugos",
  description: "An AI-powered platform for preparing for mock interviews",
};

// ✅ MOVED viewport to separate export (Next.js 15+ requirement)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased min-h-screen bg-gray-50`}> {/* ✅ Removed w-screen */}
        <CurrencyProvider>
          <I18nProvider>
            <LanguageBar />
            <Navigation />
            <main className="w-full max-w-full px-4 md:px-6"> {/* ✅ Added max-w-full */}
              {children}
            </main>
            <Toaster />
          </I18nProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}