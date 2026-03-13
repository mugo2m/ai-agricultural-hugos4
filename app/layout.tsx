import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import Navigation from "@/components/Navigation";
import { CurrencyProvider } from "@/lib/context/CurrencyContext";
import I18nProvider from "@/components/I18nProvider";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hugos",
  description: "An AI-powered platform for preparing for mock interviews",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased w-screen min-h-screen bg-gray-50`}>
        <CurrencyProvider>
          <I18nProvider>
            <Navigation />
            <main className="w-full min-h-screen px-4 md:px-6">
              {children}
            </main>
            <Toaster />
          </I18nProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}