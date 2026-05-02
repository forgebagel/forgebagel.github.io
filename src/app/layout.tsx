import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Movie Discovery",
  description: "Discover movies with TMDb API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-900 text-white">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
      </body>
    </html>
  );
}
