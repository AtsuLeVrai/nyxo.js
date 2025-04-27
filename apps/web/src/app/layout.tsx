import "../styles/globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import type React from "react";

const poppins = Poppins({
  weight: "600",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyxo.js - Type-Safe Discord Bot Framework",
  description:
    "Build modern, type-safe Discord bots with Nyxo.js - A next-generation framework for creating scalable and maintainable Discord applications",
  keywords: [
    "discord bot",
    "typescript",
    "discord.js",
    "bot framework",
    "nyxo.js",
  ],
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
