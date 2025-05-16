import "~/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Nyxo.js - A Next-Generation Discord Bot Framework",
  description:
    "Build modern, type-safe Discord bots with Nyxo.js - A next-generation framework for creating scalable and maintainable Discord applications",
};

const poppins = Poppins({
  weight: "600",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
