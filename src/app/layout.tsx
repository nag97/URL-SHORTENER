import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortify",
  description: "Short links. Beautifully simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-[#1d1d1f] antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
