"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { ParallaxEffect } from "~/components/animations/ParallaxEffect";
import { AnimatedText } from "~/components/animations/TextAnimation";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const scrollToFeatures = useCallback(() => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
      role="banner"
      aria-label="Hero section"
    >
      {/* Background effects - Optimized for better performance */}
      <div className="absolute inset-0 bg-dark-800">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(138,75,255,0.1),transparent_70%)]" />

        {/* Animated orbs - Reduced motion support */}
        <motion.div
          className="absolute top-0 left-0 h-[50vh] w-[50vh] rounded-full bg-primary-500/10"
          style={{ filter: "blur(100px)" }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: ["-25%", "5%", "-25%"],
                  y: ["-25%", "10%", "-25%"],
                }
          }
          transition={{
            duration: 20,
            repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        <div className="flex w-full flex-col items-center justify-center text-center">
          {/* Alpha badge */}
          <motion.div
            className="mb-6 inline-block"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 400,
              damping: 10,
            }}
          >
            <Badge
              icon={<Sparkles size={16} />}
              variant="primary"
              size="md"
              animated={!shouldReduceMotion}
              className="backdrop-blur-sm"
            >
              Currently in Alpha Development
            </Badge>
          </motion.div>

          {/* Main heading */}
          <ParallaxEffect speed={shouldReduceMotion ? 0 : 0.2}>
            <FadeIn>
              <h1 className="font-extrabold text-4xl tracking-tight md:text-6xl lg:text-7xl">
                <span className="block">Discord bots deserve</span>
                <AnimatedText
                  text="a better framework."
                  className="mt-2 block bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent"
                  delay={shouldReduceMotion ? 0 : 0.5}
                />
              </h1>
            </FadeIn>
          </ParallaxEffect>

          {/* Description */}
          <FadeIn delay={shouldReduceMotion ? 0 : 0.2}>
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

          {/* Call to action buttons */}
          <FadeIn delay={shouldReduceMotion ? 0 : 0.4}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                href="/docs"
                variant="primary"
                size="lg"
                trailingIcon={<ArrowRight className="h-5 w-5" />}
                className="min-w-[200px] text-lg"
                animated={!shouldReduceMotion}
              >
                Get Started
              </Button>

              <Button
                href="/docs/examples"
                variant="secondary"
                size="lg"
                className="min-w-[200px] text-lg"
                animated={!shouldReduceMotion}
              >
                View Examples
              </Button>
            </div>
          </FadeIn>

          {/* Framework highlights */}
          <FadeIn delay={shouldReduceMotion ? 0 : 0.6}>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "100% TypeScript", value: "Type Safe" },
                { label: "Modern Architecture", value: "Scalable" },
                { label: "Developer First", value: "Easy to Use" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="rounded-lg border border-dark-500/30 bg-dark-700/30 p-4 text-center backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.8 + index * 0.1,
                    duration: 0.5,
                  }}
                >
                  <div className="font-bold text-lg text-primary-400">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
