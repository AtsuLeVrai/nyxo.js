"use client";

import { Button } from "@/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO, NAV_LINKS } from "@/utils/constants";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Header component with navigation and responsive mobile menu
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect to change header appearance
  useEffect(() => {
    function handleScroll() {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  // Check if a link is active based on the current path
  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <motion.nav
      className={`fixed z-50 w-full border-dark-500 border-b backdrop-blur-md transition-all duration-300 ${
        scrolled ? "bg-dark-700/90 shadow-lg" : "bg-dark-700/70"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <motion.span
                className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text font-bold text-2xl text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Nyxo.js
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="ml-10 hidden md:block">
              <div className="flex space-x-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className={`group relative px-3 py-2 font-medium text-sm transition-colors ${
                      isActive(link.href)
                        ? "text-primary-400"
                        : "text-slate-300 hover:text-primary-400"
                    }`}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                  >
                    <span className="flex items-center">
                      {link.title}
                      {link.isExternal && (
                        <ExternalLink className="ml-1 h-3 w-3" />
                      )}
                    </span>

                    {/* Active indicator */}
                    {isActive(link.href) && !link.isExternal && (
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary-500"
                        layoutId="navbar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover indicator */}
                    {!isActive(link.href) && !link.isExternal && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary-500/50 transition-all duration-300 group-hover:w-full" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Button
                href={GITHUB_REPO}
                variant="outline"
                size="md"
                external
                leadingIcon={<Github className="h-5 w-5" />}
              >
                GitHub
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
              className="rounded-md p-2 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
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
            className="overflow-hidden md:hidden"
          >
            <div className="border-dark-500 border-t bg-dark-800/95 px-2 pt-2 pb-3 shadow-lg backdrop-blur-lg">
              {/* Close button */}
              <div className="flex justify-end px-4 py-2">
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-400 hover:text-white"
                  onClick={toggleMenu}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile nav links */}
              <div className="space-y-1 px-3 py-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className={`block flex items-center rounded-md px-3 py-2 font-medium text-base ${
                      isActive(link.href)
                        ? "bg-primary-500/10 text-primary-400"
                        : "text-slate-300 hover:bg-dark-700 hover:text-primary-400"
                    }`}
                    onClick={toggleMenu}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {link.title}
                    {link.isExternal && (
                      <ExternalLink className="ml-2 h-4 w-4" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile action buttons */}
              <div className="mt-4 space-y-3 px-3 pb-3">
                <Button
                  href={GITHUB_REPO}
                  variant="outline"
                  fullWidth
                  external
                  leadingIcon={<Github className="h-5 w-5" />}
                >
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
    </motion.nav>
  );
}
