import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Recursive } from "next/font/google";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lightning Fast Typeahead",
  description: "For Demo purposes only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={recursive.className}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
