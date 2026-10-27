import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Stand-in for Fractul (commercial). Swap for next/font/local once the
// licensed font files are added to app/fonts/.
const bodyFont = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOYBYCT — an antidote to bland",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={bodyFont.variable}>
      <body>{children}</body>
    </html>
  );
}
