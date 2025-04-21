import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import React, { lazy, Suspense } from "react";

// Lazy load section components for better performance
const Features = lazy(() => import("@/components/sections/Features"));
const Testimonials = lazy(() => import("@/components/sections/Testimonials"));
const CTA = lazy(() => import("@/components/sections/CTA"));

// Loading fallback component
const SectionLoading = () => (
  <div className="flex items-center justify-center py-24">
    <div className="h-8 w-8 animate-spin rounded-full border-primary-500 border-b-2" />
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-dark-700 text-slate-50">
      <Header />

      <main>
        {/* Hero is loaded immediately */}
        <Hero />

        {/* Other sections are lazy loaded */}
        <Suspense fallback={<SectionLoading />}>
          <Features />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<SectionLoading />}>
          <CTA />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
