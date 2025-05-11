import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import CTA from "~/components/sections/CTA";
import CodePreview from "~/components/sections/CodePreview";
import Features from "~/components/sections/Features";
import Hero from "~/components/sections/Hero";
import Testimonials from "~/components/sections/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-dark-700 text-slate-50">
      <Header />

      <main>
        <Hero />
        <Features />
        <CodePreview />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
