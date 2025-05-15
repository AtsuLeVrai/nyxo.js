"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "~/components/animations/FadeIn";
import { ParallaxEffect } from "~/components/animations/ParallaxEffect";
import { AnimatedText } from "~/components/animations/TextAnimation";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";

export default function Hero() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Unified backgrounds with other sections */}
      <div className="absolute inset-0 bg-dark-800">
        {/* Common grid pattern */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />

        {/* Gradients similar to Footer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(138,75,255,0.1),transparent_70%)]" />

        {/* Luminous orbs similar to Footer */}
        <motion.div
          className="absolute top-0 left-0 h-[50vh] w-[50vh] rounded-full bg-primary-500/10"
          style={{ filter: "blur(100px)" }}
          animate={{
            x: ["-25%", "5%", "-25%"],
            y: ["-25%", "10%", "-25%"],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        <div className="flex w-full flex-col items-center justify-center text-center">
          <motion.div
            className="-mt-10 mb-6 inline-block"
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
              animated
            >
              Alpha Development Stage
            </Badge>
          </motion.div>

          {/* Main title with parallax effect */}
          <ParallaxEffect speed={0.2}>
            <FadeIn>
              <h1 className="font-extrabold text-4xl tracking-tight md:text-6xl lg:text-7xl">
                <span className="block">Discord bots deserve</span>
                <AnimatedText
                  text="a better framework."
                  className="mt-2 block bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent"
                />
              </h1>
            </FadeIn>
          </ParallaxEffect>

          {/* Description with animation */}
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-slate-300 text-xl md:text-2xl">
              <span className="text-primary-400">Nyxo.js</span> is a fresh take
              on Discord bot development, offering a 100% type-safe framework
              for creating scalable, modern, and elegant applications.
            </p>
          </FadeIn>

          {/* Call to action buttons */}
          <FadeIn delay={0.4}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                href="/getting-started"
                variant="primary"
                size="lg"
                trailingIcon={<ArrowRight className="h-5 w-5" />}
                external
                className="text-lg"
                animated
              >
                Get Started
              </Button>

              <Button
                href="/docs"
                variant="secondary"
                size="lg"
                external
                className="text-lg"
                animated
              >
                View Documentation
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="-translate-x-1/2 absolute bottom-8 left-1/2 flex justify-center">
        <motion.div
          className="flex cursor-pointer flex-col items-center text-slate-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          onClick={() =>
            window.scrollTo({
              top: window.innerHeight,
              behavior: "smooth",
            })
          }
        >
          <span className="mb-2 text-sm">Scroll to explore</span>
          <motion.div
            className="h-8 w-5 rounded-full border border-slate-500 p-1"
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            <div className="h-1 w-1 rounded-full bg-primary-400" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
