"use client";

import { type Variants, motion } from "framer-motion";
import {
  Bot,
  Code,
  Package2,
  Rocket,
  Shield,
  Sparkles,
  Type,
} from "lucide-react";
import React, { type ReactElement, type ReactNode } from "react";
import {
  FadeIn,
  FadeInStagger,
  fadeVariants,
} from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Card } from "~/components/ui/Card";

interface FeatureProps {
  /** Icon to display with the feature */
  icon: ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
}

function FeatureCard({ feature }: { feature: FeatureProps }) {
  return (
    <Card variant="feature">
      <Card.Body className="flex h-full flex-col">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary-500/10">
          {feature.icon}
        </div>
        <Card.Title className="mb-2">{feature.title}</Card.Title>
        <Card.Description className="flex-grow">
          {feature.description}
        </Card.Description>

        <div className="mt-4">
          <a
            href="https://github.com/AtsuLeVrai/nyxo.js"
            className="inline-flex items-center text-primary-400 text-sm hover:text-primary-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
            <svg
              className="ml-1 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Features section component displaying the main features of Nyxo.js
 */
export default function Features(): ReactElement {
  // Features data
  const features: FeatureProps[] = [
    {
      icon: <Type className="h-6 w-6 text-primary-400" />,
      title: "100% Type Safety",
      description:
        "Full TypeScript support with robust type definitions for a safer development experience and better DX.",
    },
    {
      icon: <Package2 className="h-6 w-6 text-primary-400" />,
      title: "Modern Architecture",
      description:
        "Built with current best practices in mind, using TypeScript capabilities.",
    },
    {
      icon: <Bot className="h-6 w-6 text-primary-400" />,
      title: "Discord API Integration",
      description:
        "Designed specifically for Discord bot development with full access to Discord's rich features.",
    },
    {
      icon: <Rocket className="h-6 w-6 text-primary-400" />,
      title: "Fast Development",
      description:
        "Simplify your workflow with intuitive APIs and comprehensive documentation to build bots quickly.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary-400" />,
      title: "Error Handling",
      description:
        "Robust error handling and debugging capabilities to keep your bot running smoothly.",
    },
    {
      icon: <Code className="h-6 w-6 text-primary-400" />,
      title: "Extensible System",
      description:
        "Easily extend functionality with a plugin system that keeps your codebase organized and maintainable.",
    },
  ];

  return (
    <div className="relative bg-dark-800 py-24">
      {/* Unified backgrounds */}
      <div className="absolute inset-0">
        {/* Common grid pattern */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />

        {/* Subtle gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.05),transparent_70%)]" />

        {/* Luminous orb - positioned differently from Hero */}
        <motion.div
          className="absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-primary-500/10"
          style={{ filter: "blur(80px)" }}
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
        <FadeIn>
          <div className="text-center">
            <Badge icon={<Sparkles size={14} />} variant="primary">
              Features
            </Badge>
            <h2 className="mt-4 font-extrabold text-3xl text-slate-50 sm:text-4xl">
              Built for modern Discord bot development
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
              Nyxo.js integrates the latest TypeScript capabilities to help you
              build powerful, scalable bots with less effort.
            </p>
          </div>
        </FadeIn>

        <FadeInStagger className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeVariants.hidden as unknown as Variants}
              custom={index * 0.1}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </FadeInStagger>
      </div>
    </div>
  );
}
