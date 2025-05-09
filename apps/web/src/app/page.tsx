import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CTA from "@/components/sections/CTA";
import CodePreview from "@/components/sections/CodePreview";
import Features from "@/components/sections/Features";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import type React from "react";

export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen overflow-hidden bg-dark-700 text-slate-50">
      {/* Header */}
      <Header />

      <main>
        {/* Hero section - loaded immediately */}
        <Hero />

        {/* Features section - lazyloaded */}
        <Features />

        {/* Code Preview section - shows example code */}
        <CodePreview />

        {/* Testimonials section - lazyloaded */}
        <Testimonials />

        {/* Call to Action section - lazyloaded */}
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
