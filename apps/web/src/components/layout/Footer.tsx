"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code,
  ExternalLink,
  Github,
  Heart,
  Mail,
  MessageSquare,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Button } from "~/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO } from "~/utils/constants";

interface FooterLink {
  title: string;
  href: string;
  isExternal?: boolean;
  description?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

/**
 * Enhanced Footer component with improved links and better organization
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();

  // Enhanced social links with better descriptions
  const socialLinks = [
    {
      name: "GitHub",
      href: GITHUB_REPO,
      icon: <Github className="h-5 w-5" />,
      color: "hover:text-white",
      description: "Source code and contributions",
    },
    {
      name: "Discord",
      href: DISCORD_LINK,
      icon: <MessageSquare className="h-5 w-5" />,
      color: "hover:text-indigo-400",
      description: "Community support and discussions",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/nyxojs",
      icon: <Twitter className="h-5 w-5" />,
      color: "hover:text-blue-400",
      description: "Latest updates and announcements",
    },
  ];

  // Updated footer sections with working links only
  const footerSections: FooterSection[] = [
    {
      title: "Documentation",
      links: [
        {
          title: "Getting Started",
          href: "/docs",
          description: "Quick start guide and installation",
        },
        {
          title: "API Reference",
          href: "/docs/api",
          description: "Complete API documentation",
        },
        {
          title: "Guides & Tutorials",
          href: "/docs/guides",
          description: "Step-by-step learning materials",
        },
        {
          title: "Examples",
          href: "/docs/examples",
          description: "Real-world implementation examples",
        },
      ],
    },
    {
      title: "Community",
      links: [
        {
          title: "Discord Server",
          href: DISCORD_LINK,
          isExternal: true,
          description: "Join our community discussions",
        },
        {
          title: "GitHub Repository",
          href: GITHUB_REPO,
          isExternal: true,
          description: "Source code and issue tracking",
        },
        {
          title: "Contributors",
          href: `${GITHUB_REPO}/graphs/contributors`,
          isExternal: true,
          description: "See who's building Nyxo.js",
        },
        {
          title: "Discussions",
          href: `${GITHUB_REPO}/discussions`,
          isExternal: true,
          description: "Community Q&A and ideas",
        },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          title: "TypeScript Docs",
          href: "https://www.typescriptlang.org/docs/",
          isExternal: true,
          description: "Learn more about TypeScript",
        },
        {
          title: "Node.js Documentation",
          href: "https://nodejs.org/docs/",
          isExternal: true,
          description: "Node.js runtime documentation",
        },
        {
          title: "License (MIT)",
          href: `${GITHUB_REPO}/blob/main/LICENSE`,
          isExternal: true,
          description: "Open source license information",
        },
      ],
    },
  ];

  // Handle newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate API call - replace with actual implementation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-dark-800">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div
        className="absolute bottom-0 left-0 h-[50vh] w-[50vh] rounded-full bg-primary-500/5"
        style={{ filter: "blur(100px)" }}
      />
      <div
        className="absolute right-0 bottom-0 h-[30vh] w-[30vh] rounded-full bg-primary-500/5"
        style={{ filter: "blur(80px)" }}
      />

      {/* Main footer content */}
      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-8 xl:col-span-1">
            <div>
              <Link href="/" className="group flex items-center">
                <motion.div
                  className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 transition-colors group-hover:bg-primary-500/20"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primary-400"
                    />
                    <path
                      d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z"
                      fill="currentColor"
                      className="text-primary-400"
                    />
                  </svg>
                </motion.div>
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text font-bold text-2xl text-transparent">
                  Nyxo.js
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-slate-400 text-sm leading-relaxed">
                A next-generation Discord bot framework built with TypeScript,
                designed for developers who value type safety, modern
                architecture, and exceptional developer experience.
              </p>
            </div>

            {/* Social links */}
            <div>
              <h3 className="mb-4 font-semibold text-sm text-white">
                Connect with us
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className={`text-slate-400 transition-colors ${link.color} rounded-lg p-2 hover:bg-dark-600/50`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.name}: ${link.description}`}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    title={link.description}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation sections */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 xl:col-span-3 xl:mt-0">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 flex items-center font-semibold text-sm text-white">
                  {section.title === "Documentation" && (
                    <BookOpen className="mr-2 h-4 w-4 text-primary-400" />
                  )}
                  {section.title === "Community" && (
                    <MessageSquare className="mr-2 h-4 w-4 text-primary-400" />
                  )}
                  {section.title === "Resources" && (
                    <Code className="mr-2 h-4 w-4 text-primary-400" />
                  )}
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="group flex items-start text-slate-400 text-sm transition-colors hover:text-primary-400"
                        target={link.isExternal ? "_blank" : undefined}
                        rel={
                          link.isExternal ? "noopener noreferrer" : undefined
                        }
                        title={link.description}
                      >
                        <span className="flex-1">{link.title}</span>
                        {link.isExternal && (
                          <ExternalLink className="mt-0.5 ml-1 h-3 w-3 flex-shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-dark-500 border-t pt-8 pb-12">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 md:flex-row md:space-x-6 md:space-y-0">
              <p className="text-slate-400 text-sm">
                &copy; {currentYear} Nyxo.js. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-slate-500 text-sm">
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-primary-400"
                >
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-primary-400"
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            <div className="flex items-center text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="mx-1 h-4 w-4 text-primary-400" />
              <span>by</span>
              <a
                href="https://github.com/AtsuLeVrai"
                className="ml-1 text-primary-400 transition-colors hover:text-primary-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                AtsuLeVrai
              </a>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 border-dark-500/50 border-t pt-6 text-center">
            <p className="mx-auto max-w-2xl text-slate-500 text-xs leading-relaxed">
              Nyxo.js is an open-source project. We welcome contributions from
              developers of all skill levels. Join our community and help shape
              the future of Discord bot development.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
