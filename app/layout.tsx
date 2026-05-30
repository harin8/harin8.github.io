import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { Nav } from "@/components/chrome/Nav";
import { CommandPalette } from "@/components/chrome/CommandPalette";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "harin // ai-forward engineer",
  description:
    "Security engineer who builds with AI. An interactive console: the agent workflow behind the code, a career trace, and a grounded LLM you can query.",
  metadataBase: new URL("https://harin.dev"),
  openGraph: {
    title: "harin // ai-forward engineer",
    description:
      "Security engineer who builds with AI. The agent workflow, the stack, the principles — and a grounded LLM you can query.",
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
      className={`${jetbrains.variable} ${vt323.variable}`}
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
