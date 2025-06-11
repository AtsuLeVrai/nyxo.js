import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

/**
 * Global metadata configuration for the entire Nyxo.js application.
 * Provides default SEO settings that can be overridden by individual pages.
 */
export const metadata: Metadata = {
  title: "Nyxo.js - A Next-Generation Discord Bot Framework",
  description:
    "Build modern, type-safe Discord bots with Nyxo.js - A next-generation framework for creating scalable and maintainable Discord applications",
};

/**
 * Poppins font configuration with weight 600 for consistent typography.
 * Optimized for Latin character subset to reduce bundle size.
 */
const poppins = Poppins({
  weight: "600",
  subsets: ["latin"],
});

/**
 * Root layout component that wraps all pages in the application.
 *
 * Provides global styling, font configuration, and essential third-party integrations
 * including Vercel Analytics and Speed Insights for performance monitoring.
 *
 * @param props - Component properties
 * @param props.children - Child components to be rendered within the layout
 * @returns {JSX.Element} The root HTML structure with global providers
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
