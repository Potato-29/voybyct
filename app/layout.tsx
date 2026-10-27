import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Stand-in for Fractul (commercial). Swap for next/font/local once the
// licensed font files are added to app/fonts/.
const bodyFont = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
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
