import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cachelink",
  description: "Redis-cached redirects. Async event pipeline. Sub-3ms response.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-[#00ff41] antialiased">
        {children}
      </body>
    </html>
  );
}
