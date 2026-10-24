import type { Metadata, Viewport } from "next";
import { DM_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anti Audio",
  description: "Music for creators. Join the waitlist.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15161B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${GeistSans.variable} ${dmMono.variable}`}>
      <head>
        {/* Owners, from the Adobe Fonts kit. The kit's domain list must include the live domain. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/fqf0rlk.css" />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
