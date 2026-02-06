import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { headers } from "next/headers";
import { cloakSSROnlySecret } from "ssr-only-secrets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Pivote DE | Dein sicherer Platz für effizienten Transporteinkauf!",
  description:
    "Pivote ist die moderne Plattform für Spedition & Logistik. Effizient, sicher und digital Transporte einkaufen und verwalten.",
  keywords: [
    "Pivote",
    "Transporteinkauf",
    "Spot",
    "Preis",
    "Cargo",
    "Spotpreis",
    "Logistik",
    "Spedition",
    "Fracht",
    "Dashboard",
    "Supply Chain",
    "Versand",
    "Transportmanagement",
  ],
  authors: [{ name: "Beray Gündogdu" }],
  creator: "Pivote",
  openGraph: {
    title: "Pivote DE | Dein sicherer Platz für effizienten Transporteinkauf!",
    description:
      "Pivote ist die moderne Plattform für Spedition & Logistik. Effizient, sicher und digital Transporte einkaufen und verwalten.",
    url: "https://pivote.de",
    siteName: "Pivote",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pivote Dashboard",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pivote DE | Dein sicherer Platz für effizienten Transporteinkauf!",
    description:
      "Pivote ist die moderne Plattform für Spedition & Logistik. Effizient, sicher und digital Transporte einkaufen und verwalten.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  const encryptedCookie = await cloakSSROnlySecret(cookie ?? "", "SECRET_CLIENT_COOKIE_VAR");

  return (
    <TRPCReactProvider ssrOnlySecret={encryptedCookie}>
      <NuqsAdapter>
        <html lang="de">
          <head>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
            <Toaster closeButton={true} theme="light" richColors/>
          </body>
        </html>
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
