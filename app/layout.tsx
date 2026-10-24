import type { Metadata, Viewport } from "next";
import { DM_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  themeColor: "#EEEEEE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${GeistSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint so there is no flash. Light is the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('aa-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {/* Owners, from the Adobe Fonts kit. The kit's domain list must include the live domain. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/fqf0rlk.css" />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
