import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Yora | Moda premium para treino e lifestyle",
    template: "%s | Yora",
  },
  description:
    "Drops exclusivos de activewear premium. Peças pensadas para yoga, treino e o dia a dia com estilo.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Yora",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-yora-cream font-sans text-yora-charcoal">
        {children}
      </body>
    </html>
  );
}
