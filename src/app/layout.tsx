import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Alma Marcenaria",
    template: "%s | Alma Marcenaria",
  },
  description:
    "Móveis sob medida, decoração e marcenaria autoral com alma. Conheça a Alma Marcenaria.",
  openGraph: {
    type: "website",
    title: "Alma Marcenaria",
    description:
      "Móveis sob medida, decoração e marcenaria autoral com alma. Conheça a Alma Marcenaria.",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft"
        >
          Ir para o conteúdo
        </a>
        <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
          <CartProvider>
            <SiteHeader />
            <main id="conteudo">{children}</main>
            <SiteFooter />
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
