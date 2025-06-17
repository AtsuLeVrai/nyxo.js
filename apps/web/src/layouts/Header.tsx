"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import {
  DISCORD_LINK,
  GITHUB_CONTRIBUTORS,
  GITHUB_LICENSE,
  GITHUB_REPO,
} from "~/utils/constants";

/**
 * Interface representing a navigation link in the header
 * Contains title, href, and optional external link flag
 */
export interface NavLink {
  /**
   * Title of the navigation link
   * Used as the visible text in the navigation menu
   */
  title: string;
  /**
   * Href for the navigation link
   * Can be an internal route or an external URL
   */
  href: string;
  /**
   * Optional flag indicating if the link is external
   * If true, opens in a new tab and adds rel="noopener noreferrer"
   */
  isExternal?: boolean;
}

/**
 * Main navigation header component with mobile menu support
 *
 * This component provides the primary navigation for the application, featuring:
 * - Responsive design with separate desktop and mobile layouts
 * - Scroll-based header styling changes (background blur, border)
 * - Animated mobile menu with slide-in/slide-out transitions
 * - Active page indicators and proper accessibility attributes
 * - Keyboard navigation support (Escape key to close mobile menu)
 * - Body scroll lock when mobile menu is open
 *
 * Features:
 * - Fixed positioning with backdrop blur effects
 * - Logo with gradient text and SVG icon
 * - Centered desktop navigation with active state indicators
 * - Action buttons for GitHub and Discord
 * - Full-screen mobile menu with search placeholder
 * - Proper ARIA labels and semantic navigation structure
 *
 * @returns Fixed header navigation with responsive mobile menu
 */
export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * Navigation links for the header
   * Contains links to documentation, examples, API, license, and contributors
   * Each link can be external or internal
   */
  const NAV_LINKS: NavLink[] = [
    { title: "Docs", href: "/docs" },
    { title: "Examples", href: "/examples" },
    { title: "API", href: "/docs/api" },
    { title: "License", href: GITHUB_LICENSE, isExternal: true },
    { title: "Contributors", href: GITHUB_CONTRIBUTORS, isExternal: true },
  ];

  /**
   * Handles scroll events to change header appearance based on scroll position
   * Adds background blur and border when scrolled past threshold
   */
  useEffect(() => {
    function handleScroll() {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Closes mobile menu when the route changes
   * Ensures menu doesn't stay open during navigation
   */
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  /**
   * Handles keyboard navigation and body scroll management for mobile menu
   * - Escape key closes the menu
   * - Prevents body scroll when menu is open
   * - Restores body scroll when menu closes
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  /**
   * Toggles the mobile menu open/closed state
   * Memoized to prevent unnecessary re-renders
   */
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  /**
   * Determines if a navigation link is currently active
   * @param href - The href to check against current pathname
   * @returns Boolean indicating if the link matches the current route
   */
  function isActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  }

  return (
    <motion.nav
      className={`fixed z-50 w-full backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "border-dark-500 border-b bg-dark-800/95 shadow-lg shadow-primary-500/5"
          : "bg-transparent"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo section with brand identity */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center"
              aria-label="Nyxo.js home"
            >
              <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 transition-colors group-hover:bg-primary-500/20">
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
          </div>

          {/* Desktop navigation - centered layout */}
          <div className="flex flex-1 justify-center">
            <div className="hidden lg:block">
              <nav className="flex items-center space-x-1" role="menubar">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="group relative px-3 py-2 font-medium text-sm transition-colors"
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                    role="menuitem"
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    <span
                      className={`flex items-center rounded-md px-3 py-2 transition-all ${
                        isActive(link.href)
                          ? "bg-primary-500/10 text-primary-400"
                          : "text-slate-300 hover:bg-dark-600/50 hover:text-primary-400"
                      }`}
                    >
                      {link.title}
                      {link.isExternal && (
                        <ExternalLink
                          className="ml-1 h-3 w-3"
                          aria-hidden="true"
                        />
                      )}
                    </span>

                    {/* Animated active page indicator */}
                    {isActive(link.href) && !link.isExternal && (
                      <motion.span
                        className="-translate-x-1/2 absolute bottom-0 left-1/2 h-0.5 w-12 rounded-full bg-primary-500"
                        layoutId="navbar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <Button
              href={GITHUB_REPO}
              variant="outline"
              size="md"
              external={true}
              leadingIcon={<Github className="h-5 w-5" />}
              aria-label="View Nyxo.js on GitHub"
            >
              GitHub
            </Button>

            <Button
              href={DISCORD_LINK}
              variant="primary"
              size="md"
              external={true}
              aria-label="Join Discord community"
            >
              Join Discord
            </Button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 transition-colors hover:bg-dark-600/50 hover:text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with slide animation */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 top-16 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop overlay */}
            <motion.div
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-md"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />

            {/* Mobile menu content panel */}
            <motion.div
              className="relative h-full w-full max-w-sm border-dark-500/30 border-r bg-dark-800/95 shadow-2xl backdrop-blur-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex h-full flex-col">
                {/* Mobile menu header */}
                <div className="flex-shrink-0 p-6">
                  <div className="flex items-center justify-between border-dark-500/30 border-b pb-6">
                    <Link
                      href="/"
                      className="flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20">
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
                      <div>
                        <h2 className="font-bold text-lg text-white">
                          Nyxo.js
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Discord Bot Framework
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-dark-600 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto px-6">
                  {/* Search placeholder */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="flex h-12 items-center rounded-lg border border-dark-500 bg-dark-700/50">
                        <div className="flex h-full items-center pl-4 text-slate-400">
                          <Search className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search documentation..."
                          className="h-full w-full bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
                          aria-label="Search documentation"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile navigation links */}
                  <nav className="mb-8 space-y-1" role="menu">
                    {NAV_LINKS.map((link) => (
                      <div key={link.title}>
                        <Link
                          href={link.href}
                          className={`flex items-center justify-between rounded-lg px-4 py-3 font-medium text-lg transition-colors ${
                            isActive(link.href)
                              ? "bg-primary-500/10 text-primary-400"
                              : "text-slate-300 hover:bg-dark-700 hover:text-primary-400"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                          target={link.isExternal ? "_blank" : undefined}
                          rel={
                            link.isExternal ? "noopener noreferrer" : undefined
                          }
                          role="menuitem"
                          aria-current={
                            isActive(link.href) ? "page" : undefined
                          }
                        >
                          <span>{link.title}</span>
                          {link.isExternal && (
                            <ExternalLink
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                        </Link>
                      </div>
                    ))}
                  </nav>

                  {/* Mobile action buttons */}
                  <div className="space-y-4">
                    <Button
                      href={GITHUB_REPO}
                      variant="outline"
                      fullWidth
                      external={true}
                      leadingIcon={<Github className="h-5 w-5" />}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View on GitHub
                    </Button>

                    <Button
                      href={DISCORD_LINK}
                      variant="primary"
                      fullWidth
                      external={true}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join Discord
                    </Button>
                  </div>
                </div>

                {/* Mobile menu footer */}
                <div className="flex-shrink-0 border-dark-500/30 border-t p-6 text-center">
                  <p className="text-slate-400 text-sm">
                    Built with ❤️ by the Nyxo.js team
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
