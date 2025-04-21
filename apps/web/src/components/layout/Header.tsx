"use client";

import { Button } from "@/components/ui/Button";
import {
  DISCORD_LINK,
  GITHUB_CONTRIBUTORS,
  GITHUB_LICENSE,
  GITHUB_REPO,
} from "@/utils/constants";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const navLinks = [
  { title: "Docs", href: "/docs" },
  {
    title: "License",
    href: GITHUB_LICENSE,
  },
  {
    title: "Contributors",
    href: GITHUB_CONTRIBUTORS,
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed z-50 w-full border-dark-500 border-b bg-dark-700/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text font-bold text-2xl text-transparent">
                Nyxo.js
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="ml-10 hidden md:block">
              <div className="flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="px-3 py-2 font-medium text-slate-300 text-sm transition-colors hover:text-primary-400"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Button href={GITHUB_REPO} variant="outline" size="md" external>
                View on GitHub
              </Button>

              <Button href={DISCORD_LINK} variant="primary" size="md" external>
                Join Discord
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-slate-300 hover:text-white"
              aria-label="Toggle menu"
              onClick={toggleMenu}
            >
              <svg
                className="h-6 w-6"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="border-dark-500 border-t bg-dark-800 px-2 pt-2 pb-3 shadow-lg">
              {/* Close button */}
              <div className="flex justify-end px-4 py-2">
                <button
                  type="button"
                  className="text-slate-400 hover:text-white"
                  onClick={toggleMenu}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile nav links */}
              <div className="space-y-1 px-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="block rounded-md px-3 py-2 font-medium text-base text-slate-300 hover:bg-dark-700 hover:text-primary-400"
                    onClick={toggleMenu}
                  >
                    {link.title}
                  </Link>
                ))}
              </div>

              {/* Mobile action buttons */}
              <div className="mt-4 space-y-3 px-3 pb-3">
                <Button href={GITHUB_REPO} variant="outline" fullWidth external>
                  View on GitHub
                </Button>

                <Button
                  href={DISCORD_LINK}
                  variant="primary"
                  fullWidth
                  external
                >
                  Join Discord
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
