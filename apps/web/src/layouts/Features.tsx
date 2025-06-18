"use client";

import {
  Bot,
  Code,
  ExternalLink,
  Package2,
  Rocket,
  Shield,
  Sparkles,
  Type,
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Card } from "~/components/ui/Card";

/**
 * Props for individual feature items
 */
interface FeatureProps {
  /** Icon to display with the feature */
  icon: ReactNode;
  /** Feature title */
  title: string;
  /** Detailed feature description */
  description: string;
  /** Optional link to more information about the feature */
  link?: {
    /** URL to navigate to */
    href: string;
    /** Text label for the link */
    label: string;
    /** Whether the link opens in a new tab */
    external?: boolean;
  };
  /** Optional custom color class for the icon container */
  iconColor?: string;
}

/**
 * Props for the FeatureCard component
 */
interface FeatureCardProps {
  /** Feature data to display in the card */
  feature: FeatureProps;
}

/**
 * Individual feature card component with hover effects and optional link
 *
 * Renders a single feature as an interactive card with:
 * - Icon with customizable background color
 * - Title and description content
 * - Optional external or internal link
 * - Hover animations and visual feedback
 * - Background gradient effects
 *
 * @param props - Component props containing feature data
 * @returns Styled feature card with interactive elements
 */
function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <Card
      variant="feature"
      className="group h-full transition-all duration-300 hover:border-primary-500/30"
    >
      {/* @ts-ignore */}
      <Card.Body className="relative flex h-full flex-col overflow-hidden">
        {/* Animated background gradient that responds to hover */}
        <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-primary-500/10 blur-2xl transition-all duration-300 group-hover:bg-primary-500/20" />

        <div className="relative flex-1">
          {/* Feature icon with styled container */}
          <div
            className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 transition-all duration-300 group-hover:bg-primary-500/20 ${feature.iconColor || ""}`}
          >
            {feature.icon}
          </div>

          {/* Feature content */}
          {/* @ts-ignore */}
          <Card.Title className="mb-3 text-xl">{feature.title}</Card.Title>
          {/* @ts-ignore */}
          <Card.Description className="flex-grow text-base leading-relaxed">
            {feature.description}
            {/* @ts-ignore */}
          </Card.Description>

          {/* Optional link with icon and hover effects */}
          {feature.link && (
            <div className="mt-6">
              <a
                href={feature.link.href}
                className="group/link inline-flex items-center text-primary-400 text-sm transition-colors hover:text-primary-300"
                target={feature.link.external ? "_blank" : undefined}
                rel={feature.link.external ? "noopener noreferrer" : undefined}
              >
                {feature.link.label}
                {/* Render appropriate icon based on link type */}
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
 * Features section component showcasing framework capabilities
 *
 * This component renders a comprehensive features section that highlights
 * the key advantages and capabilities of the Nyxo.js framework:
 *
 * Features displayed:
 * - Type safety with TypeScript
 * - Modern architecture patterns
 * - Discord-first design approach
 * - Developer experience optimizations
 * - Robust error handling
 * - Extensible plugin system
 *
 * Design elements:
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Staggered fade-in animations for visual appeal
 * - Background effects with grid patterns and blur orbs
 * - Interactive cards with hover states
 * - Semantic section structure for accessibility
 *
 * @returns Complete features section with animated cards and content
 */
export default function Features(): ReactElement {
  /**
   * Framework features data with comprehensive descriptions and documentation links
   * Each feature includes an icon, title, description, and optional link to relevant docs
   */
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

  return (
    <section
      className="relative bg-dark-800 py-24"
      aria-label="Features section"
    >
      {/* Background visual effects */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.05),transparent_70%)]" />

        {/* Decorative blur orb for visual interest */}
        <div className="absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-primary-500/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header with badge and descriptive content */}
        <FadeIn>
          <div className="text-center">
            <Badge icon={<Sparkles size={14} />} variant="primary">
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

        {/* Responsive features grid with staggered animations */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.1}>
              <FeatureCard feature={feature} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
