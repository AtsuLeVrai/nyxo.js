"use client";

import { FadeInWhenVisible } from "@/components/animations/MotionEffects";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import {
  Bot,
  Code,
  Package2,
  Rocket,
  Shield,
  Sparkles,
  Type,
} from "lucide-react";
import type React from "react";

// Feature type definition
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Individual feature card component
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

export default function Features() {
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
        "Built with current best practices in mind, using the latest Discord.js features and TypeScript capabilities.",
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
    <div className="bg-dark-700 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
          <div className="text-center">
            <Badge icon={<Sparkles size={14} />} variant="primary">
              Features
            </Badge>
            <h2 className="mt-4 font-extrabold text-3xl text-slate-50 sm:text-4xl">
              Built for modern Discord bot development
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
              Nyxo.js integrates the latest TypeScript and Discord.js
              capabilities to help you build powerful, scalable bots with less
              effort.
            </p>
          </div>
        </FadeInWhenVisible>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Feature cards */}
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: index * 0.1 },
                },
              }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
