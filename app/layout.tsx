import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play Together - 2D Virtual World with AI Bots",
  description:
    "Explore a colorful 2D virtual world! Move with arrow keys, meet AI bot characters, and enjoy a social sandbox game inspired by Play Together.",
  keywords: [
    "2D game",
    "virtual world",
    "AI bots",
    "multiplayer",
    "play together",
    "social game",
    "browser game",
    "arrow keys game",
  ],
  authors: [{ name: "Play Together" }],
  creator: "Play Together",
  publisher: "Play Together",
  applicationName: "Play Together",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Play Together - 2D Virtual World with AI Bots",
    description:
      "Explore a colorful 2D virtual world! Move with arrow keys, meet AI bot characters, and enjoy a social sandbox game.",
    type: "website",
    locale: "en_US",
    siteName: "Play Together",
    images: [
      {
        url: "https://placehold.co/1200x630/7c3aed/ffffff?text=Play+Together",
        width: 1200,
        height: 630,
        alt: "Play Together - 2D Virtual World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Together - 2D Virtual World with AI Bots",
    description:
      "Explore a colorful 2D virtual world! Move with arrow keys, meet AI bot characters, and enjoy a social sandbox game.",
    images: ["https://placehold.co/1200x630/7c3aed/ffffff?text=Play+Together"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "game",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#0a0a0f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen overflow-hidden bg-[#0a0a0f] text-[#f8f8f8] antialiased">
        {children}
      </body>
    </html>
  );
}
