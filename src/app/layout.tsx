import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Northstar — Client workspace",
  description:
    "A fictional European business workspace. Projects, customers, and insights, beautifully connected.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/geist-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
