"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "~/components/animations/FadeIn";
import { AnimatedText } from "~/components/animations/TextAnimation";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-16">
      {/* Background elements */}
      <div className="absolute inset-0 bg-dark-700">
        {/* Radial gradients for visual effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.18),transparent_70%)]" />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="-bottom-[20%] -left-[10%] absolute h-[80%] w-[80%] opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(138,75,255,0.3) 0%, rgba(138,75,255,0.15) 30%, rgba(138,75,255,0.05) 60%, transparent 70%)",
              filter: "blur(40px)",
              transform: "rotate(-5deg)",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.05),transparent_60%)]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        <div className="text-center">
          {/* Alpha badge */}
          <motion.div
            className="mb-4 inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge icon={<Sparkles size={16} />} variant="primary" size="md">
              Alpha Development Stage
            </Badge>
          </motion.div>

          {/* Main heading */}
          <FadeIn>
            <h1 className="font-extrabold text-4xl tracking-tight md:text-6xl">
              <span className="block">Discord bots deserve</span>
              <AnimatedText
                text="a better framework."
                className="mt-2 block bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent"
              />
            </h1>
          </FadeIn>

          {/* Description */}
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-slate-300 text-xl">
              Nyxo.js is a fresh take on Discord bot development, offering a
              100% type-safe framework for creating scalable, modern, and
              elegant applications.
            </p>
          </FadeIn>

          {/* Call to action buttons */}
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                href="/getting-started"
                variant="primary"
                size="lg"
                trailingIcon={<ArrowRight className="h-5 w-5" />}
                external
              >
                Get Started
              </Button>

              <Button href="/docs" variant="secondary" size="lg" external>
                View Documentation
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
