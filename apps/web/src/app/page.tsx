import CTA from "~/layouts/CTA";
import Features from "~/layouts/Features";
import Footer from "~/layouts/Footer";
import Header from "~/layouts/Header";
import Hero from "~/layouts/Hero";

/**
 * Homepage component for the Nyxo.js website.
 *
 * Renders the main landing page showcasing the Discord bot framework features,
 * including hero section, features overview, call-to-action, and footer.
 */
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
