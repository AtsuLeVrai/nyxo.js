import type { Metadata } from "next";
import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import CTA from "~/components/sections/CTA";
import Features from "~/components/sections/Features";
import Hero from "~/components/sections/Hero";

export const metadata: Metadata = {
  title: "Nyxo.js - Next-Generation Discord Bot Framework",
  description:
    "Build modern, type-safe Discord bots with Nyxo.js. A powerful TypeScript framework featuring 100% type safety, modern architecture, and developer-friendly APIs.",
  keywords: [
    "Discord bot",
    "TypeScript",
    "Framework",
    "Bot development",
    "Node.js",
    "Type-safe",
    "Modern development",
  ],
  authors: [{ name: "AtsuLeVrai" }],
  creator: "AtsuLeVrai",
  openGraph: {
    title: "Nyxo.js - Next-Generation Discord Bot Framework",
    description:
      "Build modern, type-safe Discord bots with Nyxo.js. A powerful TypeScript framework featuring 100% type safety, modern architecture, and developer-friendly APIs.",
    url: "https://nyxojs.vercel.app",
    siteName: "Nyxo.js",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nyxo.js - Next-Generation Discord Bot Framework",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyxo.js - Next-Generation Discord Bot Framework",
    description:
      "Build modern, type-safe Discord bots with Nyxo.js. A powerful TypeScript framework featuring 100% type safety, modern architecture, and developer-friendly APIs.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-dark-800 to-dark-900 text-slate-50">
      <Header />

      <main>
        <Hero />
        <Features />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
