import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Virtual World — Play with Friends & AI People",
  description:
    "A 2D virtual world where you can explore, meet AI bots, and hang out with friends. Move with arrow keys and discover a colorful world.",
  keywords: [
    "virtual world",
    "2d game",
    "play together",
    "online game",
    "ai bots",
    "social game",
  ],
  openGraph: {
    title: "Virtual World — Play with Friends & AI People",
    description:
      "A 2D virtual world where you can explore, meet AI bots, and hang out with friends.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
