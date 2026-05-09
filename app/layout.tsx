import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk, VT323 } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { Nav } from "@/components/chrome/Nav";
import { CommandPalette } from "@/components/chrome/CommandPalette";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "harin // operator console",
  description:
    "Cybersecurity engineer building product. Decryption, code, and the long pivot to PM.",
  metadataBase: new URL("https://harin.dev"),
  openGraph: {
    title: "harin // operator console",
    description:
      "Cybersecurity engineer building product. Decryption, code, and the long pivot to PM.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07090c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jetbrains.variable} ${spaceGrotesk.variable} ${vt323.variable}`}
    >
      <body className="bg-bg text-ink">
        <SmoothScroll />
        <Nav />
        <main className="relative z-10">{children}</main>
        <div className="crt-noise" aria-hidden />
        <div className="crt-scanlines" aria-hidden />
        <div className="crt-vignette" aria-hidden />
        <CommandPalette />
      </body>
    </html>
  );
}
