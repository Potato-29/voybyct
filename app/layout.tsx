import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

// Deuterium Variable (the Figma font), weight axis 100–900.
const bodyFont = localFont({
  src: "./fonts/DeuteriumVariable.woff2",
  weight: "100 900",
  variable: "--font-body",
});

// The icon and Open Graph image come from app/icon.png and app/opengraph-image.jpg.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={bodyFont.variable}>
      <body>{children}</body>
    </html>
  );
}
