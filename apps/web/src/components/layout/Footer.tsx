"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Heart,
  Mail,
  MessageSquare,
  Twitter,
  Youtube,
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
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

/**
 * Enhanced Footer component with newsletter signup, better social links, and animations
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  // Social links configuration with enhanced styling
  const socialLinks = [
    {
      name: "GitHub",
      href: GITHUB_REPO,
      icon: <Github className="h-5 w-5" />,
      color: "hover:text-white",
    },
    {
      name: "Discord",
      href: DISCORD_LINK,
      icon: <MessageSquare className="h-5 w-5" />,
      color: "hover:text-indigo-400",
    },
    {
      name: "Twitter",
      href: "https://twitter.com",
      icon: <Twitter className="h-5 w-5" />,
      color: "hover:text-blue-400",
    },
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: <Youtube className="h-5 w-5" />,
      color: "hover:text-red-500",
    },
  ];

  // Footer navigation sections
  const footerSections: FooterSection[] = [
    {
      title: "Product",
      links: [
        { title: "Features", href: "/#features" },
        { title: "Roadmap", href: "/roadmap" },
        { title: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { title: "Documentation", href: "/docs" },
        { title: "Tutorials", href: "/tutorials" },
        { title: "Examples", href: "/examples" },
        { title: "API Reference", href: "/docs/api" },
      ],
    },
    {
      title: "Community",
      links: [
        { title: "Discord", href: DISCORD_LINK, isExternal: true },
        { title: "GitHub", href: GITHUB_REPO, isExternal: true },
        {
          title: "Contributors",
          href: `${GITHUB_REPO}/graphs/contributors`,
          isExternal: true,
        },
      ],
    },
    {
      title: "Legal",
      links: [
        { title: "Privacy Policy", href: "/privacy" },
        { title: "Terms of Service", href: "/terms" },
        {
          title: "License",
          href: `${GITHUB_REPO}/blob/main/LICENSE`,
          isExternal: true,
        },
      ],
    },
  ];

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement actual subscription logic here
    setSubscribed(true);
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

      {/* Newsletter section */}
      <div className="relative border-dark-500 border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-dark-700/50 backdrop-blur-sm lg:flex lg:items-center lg:justify-between lg:p-8">
            <FadeIn className="lg:max-w-lg">
              <h2 className="font-bold text-2xl text-white">
                Subscribe to our newsletter
              </h2>
              <p className="mt-2 text-slate-300">
                Get the latest Nyxo.js updates, tutorials, and resources
                directly to your inbox. No spam, ever.
              </p>
            </FadeIn>
            <div className="mt-8 lg:mt-0">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-dark-500 bg-dark-600/50 px-5 py-3 text-base text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:max-w-xs"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      animated
                      trailingIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      Subscribe
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-lg bg-success-500/10 p-4 text-success-400">
                  <p className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Thanks for subscribing!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-8 xl:col-span-1">
            <div>
              <Link href="/" className="flex items-center">
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10">
                  <svg
                    width="24"
                    height="24"
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
                </div>
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text font-bold text-2xl text-transparent">
                  Nyxo.js
                </span>
              </Link>
              <p className="mt-2 max-w-xs text-slate-400 text-sm">
                A next-generation Discord bot framework designed for TypeScript
                developers.
              </p>
            </div>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`text-slate-400 transition-colors ${link.color}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">{link.name}</span>
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-4 xl:mt-0">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-sm text-white">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-slate-400 text-sm hover:text-primary-400"
                        target={link.isExternal ? "_blank" : undefined}
                        rel={
                          link.isExternal ? "noopener noreferrer" : undefined
                        }
                      >
                        {link.title}
                        {link.isExternal && (
                          <svg
                            className="ml-1 h-3 w-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright and contact */}
        <div className="mt-12 border-dark-500 border-t pt-8 pb-12">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-slate-400 text-sm">
              &copy; {currentYear} Nyxo.js. All rights reserved.
            </p>
            <div className="mt-4 flex items-center md:mt-0">
              <a
                href="mailto:contact@example.com"
                className="flex items-center text-slate-400 text-sm hover:text-primary-400"
              >
                <Mail className="mr-1 h-4 w-4" />
                contact@example.com
              </a>
              <span className="mx-4 text-slate-600">|</span>
              <p className="flex items-center text-slate-400 text-sm">
                Made with <Heart className="mx-1 h-4 w-4 text-primary-400" /> by
                AtsuLeVrai
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
