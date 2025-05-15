"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github, MessagesSquare } from "lucide-react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Button } from "~/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO } from "~/utils/constants";

export default function CTA() {
  return (
    <div className="relative bg-dark-800 py-24">
      {/* Unified backgrounds */}
      <div className="absolute inset-0">
        {/* Common grid pattern */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-10" />

        {/* More intense gradients for the CTA */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.2),transparent_70%)]" />

        {/* Animated luminous orbs */}
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

        <motion.div
          className="absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-cyan-500/10"
          style={{ filter: "blur(100px)" }}
          animate={{
            x: ["25%", "-5%", "25%"],
            y: ["25%", "-10%", "25%"],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <h2 className="font-extrabold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
            <span className="block">
              Ready to transform your Discord bot development?
            </span>
            <span className="mt-2 block bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              Start building with Nyxo.js today.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
            Join our community of developers creating next-generation Discord
            bots with a modern TypeScript framework.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              href={GITHUB_REPO}
              variant="primary"
              size="lg"
              leadingIcon={<Github className="h-5 w-5" />}
              trailingIcon={<ArrowRight className="h-5 w-5" />}
              external
              className="text-lg"
            >
              Star on GitHub
            </Button>

            <Button
              href={DISCORD_LINK}
              variant="secondary"
              size="lg"
              external
              leadingIcon={<MessagesSquare className="h-5 w-5" />}
              className="text-lg"
            >
              Join our Discord
            </Button>
          </div>

          {/* Counter for community size */}
          <div className="mx-auto mt-12 max-w-md">
            <div className="relative overflow-hidden rounded-lg border border-dark-500 bg-dark-900/50 px-6 py-4 backdrop-blur-sm">
              <div
                className="-right-8 -top-8 absolute h-24 w-24 rounded-full bg-primary-500/20"
                style={{ filter: "blur(30px)" }}
              />
              <div
                className="-bottom-8 -left-8 absolute h-24 w-24 rounded-full bg-primary-500/20"
                style={{ filter: "blur(30px)" }}
              />

              <p className="font-medium text-slate-300 text-sm">
                Join 5,000+ developers already using Nyxo.js
              </p>
              <div className="mt-2 flex items-center justify-center">
                <div className="-space-x-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: not needed
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-dark-800 bg-gradient-to-r from-slate-700 to-dark-600"
                    />
                  ))}
                </div>
                <div className="ml-2 font-medium text-primary-400">
                  +500 this month
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
