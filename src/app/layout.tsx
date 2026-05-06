import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CLAVIO Movies",
  description: "Discover your favorite movies and TV shows with CLAVIO Movies",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark bg-slate-950" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-950 text-white overflow-x-hidden">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  );
}
