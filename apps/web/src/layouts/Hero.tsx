"use client";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";

/**
 * Hero section component for the landing page
 *
 * This component renders the main hero section that serves as the primary
 * introduction to the Nyxo.js framework. It's designed to be the first
 * thing users see and includes:
 *
 * Key elements:
 * - Beta development status badge
 * - Compelling headline with gradient text effects
 * - Framework value proposition and description
 * - Primary and secondary call-to-action buttons
 * - Framework highlights showcasing key benefits
 * - Full-screen layout with centered content
 *
 * Visual features:
 * - Layered background effects with grid patterns and blur orbs
 * - Staggered fade-in animations for progressive disclosure
 * - Responsive typography scaling across device sizes
 * - Gradient text effects for visual impact
 * - Accessible design with proper semantic structure
 *
 * @returns Full-screen hero section with animated content and CTAs
 */
export default function Hero() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
      aria-label="Hero section"
    >
      {/* Layered background effects for visual depth */}
      <div className="absolute inset-0 bg-dark-800">
        {/* Grid pattern overlay for texture */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />
        {/* Multiple radial gradients for depth and color variation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(138,75,255,0.1),transparent_70%)]" />

        {/* Decorative blur orb for ambient lighting effect */}
        <div className="absolute top-0 left-0 h-[50vh] w-[50vh] rounded-full bg-primary-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        <div className="flex w-full flex-col items-center justify-center text-center">
          {/* Development status badge */}
          <FadeIn>
            <Badge
              icon={<Sparkles size={16} />}
              variant="primary"
              size="md"
              className="mb-6 backdrop-blur-sm"
            >
              Currently in Beta Development
            </Badge>
          </FadeIn>

          {/* Main headline with gradient text effect */}
          <FadeIn delay={0.2}>
            <h1 className="font-extrabold text-4xl tracking-tight md:text-6xl lg:text-7xl">
              <span className="block">Discord bots deserve</span>
              <span className="mt-2 block bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                a better framework.
              </span>
            </h1>
          </FadeIn>

          {/* Framework description and value proposition */}
          <FadeIn delay={0.4}>
            <p className="mx-auto mt-6 max-w-3xl text-slate-300 text-xl leading-relaxed md:text-2xl">
              <span className="font-semibold text-primary-400">Nyxo.js</span> is
              a modern Discord bot framework built with TypeScript, offering{" "}
              <span className="font-medium text-primary-300">
                100% type safety
              </span>
              , intuitive APIs, and enterprise-grade architecture for scalable
              applications.
            </p>
          </FadeIn>

          {/* Primary call-to-action buttons */}
          <FadeIn delay={0.6}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                href="/docs"
                variant="primary"
                size="lg"
                trailingIcon={<ArrowRight className="h-5 w-5" />}
                className="min-w-[200px] text-lg"
              >
                Get Started
              </Button>

              <Button
                href="/docs/examples"
                variant="secondary"
                size="lg"
                className="min-w-[200px] text-lg"
              >
                View Examples
              </Button>
            </div>
          </FadeIn>

          {/* Framework key highlights grid */}
          <FadeIn delay={0.8}>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Framework benefit highlights with concise messaging */}
              {[
                { label: "100% TypeScript", value: "Type Safe" },
                { label: "Modern Architecture", value: "Scalable" },
                { label: "Developer First", value: "Easy to Use" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-dark-500/30 bg-dark-700/30 p-4 text-center backdrop-blur-sm"
                >
                  {/* Benefit value */}
                  <div className="font-bold text-lg text-primary-400">
                    {stat.value}
                  </div>
                  {/* Benefit description */}
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
