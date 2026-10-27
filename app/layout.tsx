import type { Metadata } from "next";
import { site } from "@/lib/site";
import "./globals.css";

// Adobe Fonts kit serving Fractul Variable (the Figma font) as "fractul-variable".
// Manage the kit's allowed domains at fonts.adobe.com > Web Projects.
const FONT_KIT_URL = "https://use.typekit.net/crv5whm.css";

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
    <html lang="en">
      <body>
        {/* React hoists this into <head>. */}
        <link rel="stylesheet" href={FONT_KIT_URL} precedence="default" />
        {children}
      </body>
    </html>
  );
}
