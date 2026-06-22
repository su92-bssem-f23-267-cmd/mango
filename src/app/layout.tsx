import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mango Mart - Premium Exotic Mangoes & Delicacies",
  description: "Shop hand-picked fresh exotic mangoes (Alphonso, Kesar, Sindhri, Chaunsa) and organic mango delicacies directly from our orchards.",
  keywords: "mangoes, fresh mangoes, alphonso mango, kesar mango, online mango shop, order mangoes, mango pulp",
  openGraph: {
    title: "Mango Mart - Premium Exotic Mangoes & Delicacies",
    description: "Shop hand-picked fresh exotic mangoes and organic mango delicacies directly from our orchards.",
    type: "website",
    locale: "en_US",
    siteName: "Mango Mart",
  }
};

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <span className="text-lg font-black tracking-tight text-primary">🥭 Mango Mart</span>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
        
        {/* Floating WhatsApp Action Button */}
        <a
          href="https://wa.me/923056662974"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:shadow-[#25D366]/30 hover:shadow-xl transition-all duration-300 group hover:scale-105 active:scale-95 border border-white/10"
          aria-label="Chat on WhatsApp"
        >
          <svg
            className="h-5.5 w-5.5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.905-6.99C16.357 1.875 13.879.843 11.242.843 5.805.843 1.383 5.263 1.38 10.7c-.001 1.532.404 3.031 1.174 4.366l-.993 3.612 3.702-.971zm11.365-5.123c-.302-.151-1.791-.882-2.067-.983-.277-.101-.478-.151-.678.151-.2.302-.779.983-.955 1.183-.176.2-.352.226-.654.076-.302-.151-1.274-.469-2.427-1.498-.897-.8-1.502-1.787-1.678-2.089-.176-.302-.019-.465.132-.615.136-.135.302-.352.453-.529.151-.176.201-.302.302-.503.101-.2.05-.378-.026-.529-.075-.151-.678-1.634-.929-2.238-.244-.588-.492-.51-.678-.519-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.378-.276.302-1.056 1.031-1.056 2.516 0 1.486 1.081 2.921 1.232 3.122.151.2 2.128 3.25 5.156 4.557.72.31 1.282.496 1.72.636.723.23 1.381.19 1.902.112.58-.088 1.792-.73 2.043-1.436.252-.704.252-1.308.176-1.436-.076-.127-.277-.201-.578-.352z" />
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-xs font-black tracking-tight whitespace-nowrap">
            Chat with us
          </span>
        </a>
      </body>
    </html>
  );
}
