import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { GlobalNav } from "@/components/GlobalNav";

export const metadata: Metadata = {
  title: "SABIOXI | Sistema de Login",
  description: "Sistema de login básico premium para Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-slate-950`}
      >
        <Providers>
          <GlobalNav />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
