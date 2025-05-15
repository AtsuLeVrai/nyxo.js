import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import CTA from "~/components/sections/CTA";
import Features from "~/components/sections/Features";
import Hero from "~/components/sections/Hero";

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
