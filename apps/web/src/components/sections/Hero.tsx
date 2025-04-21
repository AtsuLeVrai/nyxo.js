"use client";

import { CodeReveal } from "@/components/animations/CodeEffects";
import { ParticleBackground } from "@/components/animations/ParticleBackground";
import { AnimatedText } from "@/components/animations/TextAnimations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  FileJson2,
  Settings,
  Sparkles,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Features to display in floating badges
const floatingFeatures = [
  {
    title: "100% Type Safety",
    description: "Full TypeScript Support",
    icon: <Settings size={16} className="text-white" />,
    color: "bg-success-400",
    position: "top-right",
  },
  {
    title: "Modern Architecture",
    description: "Best Practices by Default",
    icon: <Sparkles size={16} className="text-white" />,
    color: "bg-primary-500",
    position: "bottom-left",
  },
];

export default function Hero() {
  const [isCodeLoaded, setIsCodeLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Simulate code loading
    const timer = setTimeout(() => {
      setIsCodeLoaded(true);
    }, 800);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative overflow-hidden pt-16">
      {/* Background gradients and effects */}
      <div className="absolute inset-0 bg-dark-700">
        {/* Top right gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.18),transparent_70%)]" />

        {/* Bottom left gradient */}
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

        {/* Center gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.05),transparent_60%)]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />
      </div>

      {/* Interactive particle background - disabled on mobile for performance */}
      <ParticleBackground
        disableOnMobile={true}
        particleCount={isMobile ? 50 : 100}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        <motion.div className="text-center" initial="hidden" animate="visible">
          {/* Alpha badge */}
          <motion.div
            className="mb-4 inline-block"
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
            }}
          >
            <Badge icon={<Sparkles size={16} />} variant="primary" size="md">
              Alpha Development Stage
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="font-extrabold text-4xl tracking-tight md:text-6xl"
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.21, 0.45, 0.27, 0.9],
                },
              },
            }}
          >
            <span className="block">Discord bots deserve</span>
            <AnimatedText
              text="a better framework."
              className="mt-2 block bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent"
            />
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-slate-300 text-xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delay: 0.2, duration: 0.8 },
              },
            }}
          >
            Nyxo.js is a fresh take on Discord bot development, offering a 100%
            type-safe framework for creating scalable, modern, and elegant
            applications.
          </motion.p>

          {/* Call to action buttons */}
          <motion.div
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delay: 0.4, duration: 0.8 },
              },
            }}
          >
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
          </motion.div>
        </motion.div>

        {/* Code preview mockup */}
        <motion.div
          className="relative mx-auto mt-20 max-w-5xl md:mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-dark-500 shadow-2xl shadow-primary-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-dark-600 to-dark-700" />

            {/* Code mockup */}
            <div className="absolute inset-0 flex flex-col p-4">
              <div className="flex items-center space-x-2 border-dark-500 border-b pb-2">
                <div className="h-3 w-3 rounded-full bg-dark-500" />
                <div className="h-3 w-3 rounded-full bg-dark-500" />
                <div className="h-3 w-3 rounded-full bg-dark-500" />
                <div className="ml-2 text-slate-400 text-xs">
                  bot.ts - Nyxo.js Project
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - hidden on mobile */}
                <div
                  className={`${isMobile ? "hidden" : "w-48"} border-dark-500 border-r p-2`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2 text-slate-400">
                      <Terminal size={16} className="mr-2" />
                      <span className="text-sm">commands/</span>
                    </div>
                    <div className="flex items-center px-3 py-2 text-slate-400">
                      <Bot size={16} className="mr-2" />
                      <span className="text-sm">events/</span>
                    </div>
                    <div className="flex items-center rounded bg-primary-500/10 px-3 py-2 text-primary-400">
                      <FileJson2 size={16} className="mr-2" />
                      <span className="font-medium text-sm">bot.ts</span>
                    </div>
                    <div className="flex items-center px-3 py-2 text-slate-400">
                      <Settings size={16} className="mr-2" />
                      <span className="text-sm">config.ts</span>
                    </div>
                  </div>
                </div>

                {/* Main content - code area */}
                <div className="flex-1 p-3 font-mono text-sm">
                  {isCodeLoaded ? (
                    <CodeReveal code={"// Please be patient, loading..."} />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges - positioned absolutely */}
          {floatingFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className={`absolute rounded-lg border border-dark-500 bg-dark-600 p-3 shadow-lg ${
                feature.position === "top-right"
                  ? "-top-6 -right-6"
                  : "-bottom-4 -left-6"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.2, duration: 0.5 }}
            >
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-white text-xs">
                    {feature.title}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
