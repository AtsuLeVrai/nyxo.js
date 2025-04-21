import "../styles/globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import type React from "react";

const poppins = Poppins({
  weight: "600",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyxo.js - TypeScript Discord Framework",
  description: "A Next-Gen TypeScript Framework for Scalable Discord Bots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
