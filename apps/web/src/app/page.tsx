import dynamic from "next/dynamic";
import type React from "react";

import Footer from "@/components/layout/Footer";
// Layout components
import Header from "@/components/layout/Header";

// Static imports for critical above-the-fold content
import Hero from "@/components/sections/Hero";

// Dynamic imports for better performance
const Features = dynamic(() => import("@/components/sections/Features"), {
  loading: () => <SectionLoading />,
});

const Testimonials = dynamic(
  () => import("@/components/sections/Testimonials"),
  {
    loading: () => <SectionLoading />,
  },
);

const CTA = dynamic(() => import("@/components/sections/CTA"), {
  loading: () => <SectionLoading />,
});

const CodePreview = dynamic(() => import("@/components/sections/CodePreview"), {
  loading: () => <SectionLoading />,
});

// Loading component
const SectionLoading = (): React.ReactElement => (
  <div className="flex items-center justify-center py-24">
    <div className="h-8 w-8 animate-spin rounded-full border-primary-500 border-b-2" />
  </div>
);

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
