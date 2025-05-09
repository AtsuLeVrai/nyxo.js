import "@/styles/globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";

// Load the Poppins font with specific weight
const poppins = Poppins({
  weight: "600",
  subsets: ["latin"],
});

// Define page metadata
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

/**
 * Root layout component that wraps the entire application
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
