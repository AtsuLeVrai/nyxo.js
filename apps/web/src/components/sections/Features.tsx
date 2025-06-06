"use client";

import { type Variants, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  Code,
  ExternalLink,
  Heart,
  Package2,
  Rocket,
  Shield,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import React, { type ReactElement, type ReactNode } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Card } from "~/components/ui/Card";

interface FeatureProps {
  /** Icon to display with the feature */
  icon: ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Link to more information */
  link?: {
    href: string;
    label: string;
    external?: boolean;
  };
  /** Highlight color for the icon */
  iconColor?: string;
}

function FeatureCard({ feature }: { feature: FeatureProps }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card
      variant="feature"
      animate={!shouldReduceMotion}
      className="group h-full transition-all duration-300 hover:border-primary-500/30"
    >
      {/* @ts-ignore */}
      <Card.Body className="relative flex h-full flex-col overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-primary-500/10 blur-2xl transition-all duration-300 group-hover:bg-primary-500/20" />

        <div className="relative flex-1">
          {/* Icon */}
          <div
            className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 transition-all duration-300 group-hover:bg-primary-500/20 ${feature.iconColor || ""}`}
          >
            {feature.icon}
          </div>

          {/* Content */}
          {/* @ts-ignore */}
          <Card.Title className="mb-3 text-xl">{feature.title}</Card.Title>
          {/* @ts-ignore */}
          <Card.Description className="flex-grow text-base leading-relaxed">
            {feature.description}
            {/* @ts-ignore */}
          </Card.Description>

          {/* Link */}
          {feature.link && (
            <div className="mt-6">
              <a
                href={feature.link.href}
                className="group/link inline-flex items-center text-primary-400 text-sm transition-colors hover:text-primary-300"
                target={feature.link.external ? "_blank" : undefined}
                rel={feature.link.external ? "noopener noreferrer" : undefined}
              >
                {feature.link.label}
                {feature.link.external ? (
                  <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                ) : (
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
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
                )}
              </a>
            </div>
          )}
        </div>
        {/* @ts-ignore */}
      </Card.Body>
    </Card>
  );
}

/**
 * Enhanced Features section component displaying the main features of Nyxo.js
 */
export default function Features(): ReactElement {
  const shouldReduceMotion = useReducedMotion();

  // Enhanced features data with better descriptions and links
  const features: FeatureProps[] = [
    {
      icon: <Type className="h-6 w-6 text-primary-400" />,
      title: "100% Type Safety",
      description:
        "Built from the ground up with TypeScript, providing comprehensive type definitions, intelligent autocompletion, and compile-time error checking for a superior development experience.",
      link: {
        href: "/docs/core-concepts#type-safety",
        label: "Learn about type safety",
      },
    },
    {
      icon: <Package2 className="h-6 w-6 text-cyan-400" />,
      title: "Modern Architecture",
      description:
        "Leverages contemporary design patterns including dependency injection, modular structure, and clean architecture principles for maintainable and scalable applications.",
      link: {
        href: "/docs/core-concepts#architecture",
        label: "Explore architecture",
      },
    },
    {
      icon: <Bot className="h-6 w-6 text-purple-400" />,
      title: "Discord-First Design",
      description:
        "Purpose-built for Discord with native support for slash commands, interactions, message components, and all modern Discord features out of the box.",
      link: {
        href: "/docs/guides/basic-bot",
        label: "Build your first bot",
      },
    },
    {
      icon: <Rocket className="h-6 w-6 text-amber-400" />,
      title: "Developer Experience",
      description:
        "Intuitive APIs, comprehensive documentation, hot reload in development, powerful debugging tools, and extensive examples to accelerate your development workflow.",
      link: {
        href: "/docs/guides",
        label: "View guides",
      },
    },
    {
      icon: <Shield className="h-6 w-6 text-green-400" />,
      title: "Robust Error Handling",
      description:
        "Advanced error handling with automatic recovery, detailed logging, graceful degradation, and built-in monitoring to ensure your bot stays online and responsive.",
      link: {
        href: "/docs/guides/error-handling",
        label: "Error handling guide",
      },
    },
    {
      icon: <Code className="h-6 w-6 text-pink-400" />,
      title: "Extensible Plugin System",
      description:
        "Modular plugin architecture allowing you to extend functionality, share components across projects, and integrate with third-party services seamlessly.",
      link: {
        href: "/docs/api/plugins",
        label: "Plugin documentation",
      },
    },
  ];

  // Animation variants for stagger effect
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="features"
      className="relative bg-dark-800 py-24"
      aria-label="Features section"
    >
      {/* Background effects - Consistent with other sections */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.05),transparent_70%)]" />

        <motion.div
          className="absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-primary-500/10"
          style={{ filter: "blur(80px)" }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: ["25%", "-5%", "25%"],
                  y: ["25%", "-10%", "25%"],
                }
          }
          transition={{
            duration: 25,
            repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeIn>
          <div className="text-center">
            <Badge
              icon={<Sparkles size={14} />}
              variant="primary"
              animated={!shouldReduceMotion}
            >
              Core Features
            </Badge>
            <h2 className="mt-4 font-extrabold text-3xl text-slate-50 sm:text-4xl">
              Built for modern Discord bot development
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-300 text-xl leading-relaxed">
              Nyxo.js combines cutting-edge TypeScript capabilities with
              intuitive APIs to help you build powerful, scalable Discord bots
              with less effort and more confidence.
            </p>
          </div>
        </FadeIn>

        {/* Features grid */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional features highlight */}
        {/*<FadeIn delay={shouldReduceMotion ? 0 : 0.8}>*/}
        {/*  <div className="relative mt-16 overflow-hidden rounded-xl border border-dark-500/50 bg-gradient-to-r from-dark-700/50 to-dark-600/50 p-8">*/}
        {/*    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-primary-500/10 blur-3xl" />*/}
        {/*    <div className="relative">*/}
        {/*      <h3 className="mb-6 flex items-center font-bold text-2xl text-white">*/}
        {/*        <Zap className="mr-3 h-6 w-6 text-primary-400" />*/}
        {/*        What Makes Nyxo.js Special*/}
        {/*      </h3>*/}
        {/*      <div className="grid grid-cols-1 gap-6 text-slate-300 md:grid-cols-2">*/}
        {/*        <div className="space-y-4">*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div className="mt-1 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary-400" />*/}
        {/*            <div>*/}
        {/*              <strong className="text-white">*/}
        {/*                Decorator-Based Commands*/}
        {/*              </strong>{" "}*/}
        {/*              - Clean, intuitive command registration with automatic*/}
        {/*              parameter validation and type inference*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div className="mt-1 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary-400" />*/}
        {/*            <div>*/}
        {/*              <strong className="text-white">*/}
        {/*                Event-Driven Architecture*/}
        {/*              </strong>{" "}*/}
        {/*              - Structured event listeners with automatic error handling*/}
        {/*              and middleware support*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div className="mt-1 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary-400" />*/}
        {/*            <div>*/}
        {/*              <strong className="text-white">*/}
        {/*                Built-in Middleware*/}
        {/*              </strong>{" "}*/}
        {/*              - Reusable middleware for authentication, rate limiting,*/}
        {/*              logging, and custom business logic*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*        <div className="space-y-4">*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div className="mt-1 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />*/}
        {/*            <div>*/}
        {/*              <strong className="text-white">*/}
        {/*                Hot Reload Development*/}
        {/*              </strong>{" "}*/}
        {/*              - Instant code changes without restarting your bot during*/}
        {/*              development*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div className="mt-1 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />*/}
        {/*            <div>*/}
        {/*              <strong className="text-white">Production Ready</strong> -*/}
        {/*              Built-in clustering, health checks, metrics, and*/}
        {/*              deployment tools for enterprise applications*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div className="mt-1 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />*/}
        {/*            <div>*/}
        {/*              <strong className="text-white">Community Driven</strong> -*/}
        {/*              Open source with an active community contributing plugins,*/}
        {/*              examples, and improvements*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      </div>*/}

        {/*      /!* GitHub link *!/*/}
        {/*      <div className="mt-8 border-dark-500/50 border-t pt-6">*/}
        {/*        <div className="flex items-center justify-between">*/}
        {/*          <div className="flex items-center">*/}
        {/*            <Heart className="mr-2 h-5 w-5 text-primary-400" />*/}
        {/*            <span className="text-slate-300">*/}
        {/*              Join our growing community of developers*/}
        {/*            </span>*/}
        {/*          </div>*/}
        {/*          <a*/}
        {/*            href={GITHUB_REPO}*/}
        {/*            className="inline-flex items-center text-primary-400 transition-colors hover:text-primary-300"*/}
        {/*            target="_blank"*/}
        {/*            rel="noopener noreferrer"*/}
        {/*          >*/}
        {/*            View on GitHub*/}
        {/*            <ExternalLink className="ml-1 h-4 w-4" />*/}
        {/*          </a>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</FadeIn>*/}
      </div>
    </section>
  );
}
