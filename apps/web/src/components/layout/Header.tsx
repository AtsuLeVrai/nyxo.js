"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Github, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO, NAV_LINKS } from "~/utils/constants";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Handle scroll effect to change header appearance
  useEffect(() => {
    function handleScroll() {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  // Handle keyboard navigation for mobile menu
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

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Check if a link is active based on the current path
  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Logo animation variants
  const logoVariants = {
    hover: {
      scale: shouldReduceMotion ? 1 : 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const logoIconVariants = {
    hover: {
      rotate: shouldReduceMotion ? 0 : 360,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

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
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center"
              aria-label="Nyxo.js home"
            >
              <motion.div
                className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20"
                variants={logoVariants}
                whileHover="hover"
              >
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  variants={logoIconVariants}
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
                </motion.svg>
              </motion.div>
              <motion.span
                className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text font-bold text-2xl text-transparent"
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Nyxo.js
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
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

                    {/* Active indicator */}
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

          {/* Desktop Action Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <Button
              href={GITHUB_REPO}
              variant="outline"
              size="md"
              external={true}
              leadingIcon={<Github className="h-5 w-5" />}
              animated={!shouldReduceMotion}
              aria-label="View Nyxo.js on GitHub"
            >
              GitHub
            </Button>

            <Button
              href={DISCORD_LINK}
              variant="primary"
              size="md"
              external={true}
              animated={!shouldReduceMotion}
              aria-label="Join Discord community"
            >
              Join Discord
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <motion.button
              type="button"
              className="rounded-md p-2 text-slate-300 transition-colors hover:bg-dark-600/50 hover:text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={toggleMenu}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-md"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />

            {/* Menu content */}
            <motion.div
              className="relative h-full w-full max-w-sm overflow-y-auto border-dark-500/30 border-r bg-dark-800/95 shadow-2xl backdrop-blur-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                {/* Mobile header */}
                <div className="mb-6 flex items-center justify-between border-dark-500/30 border-b pb-6">
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
                      <h2 className="font-bold text-lg text-white">Nyxo.js</h2>
                      <p className="text-slate-400 text-xs">
                        Discord Bot Framework
                      </p>
                    </div>
                  </Link>
                  <motion.button
                    type="button"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-dark-600 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                    whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
                    whileTap={{ scale: shouldReduceMotion ? 1 : 0.9 }}
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </motion.button>
                </div>

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
                  {NAV_LINKS.map((link, index) => (
                    <motion.div
                      key={link.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`block flex items-center justify-center rounded-lg px-4 py-3 font-medium text-lg transition-colors ${
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
                        aria-current={isActive(link.href) ? "page" : undefined}
                      >
                        {link.title}
                        {link.isExternal && (
                          <ExternalLink
                            className="ml-2 h-4 w-4"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile action buttons */}
                <div className="space-y-4">
                  {/* @ts-ignore */}
                  <Button
                    href={GITHUB_REPO}
                    variant="outline"
                    fullWidth
                    external={true}
                    leadingIcon={<Github className="h-5 w-5" />}
                    animated={!shouldReduceMotion}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    View on GitHub
                  </Button>

                  {/* @ts-ignore */}
                  <Button
                    href={DISCORD_LINK}
                    variant="primary"
                    fullWidth
                    external={true}
                    animated={!shouldReduceMotion}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Discord
                  </Button>
                </div>

                {/* Mobile footer */}
                <div className="mt-8 border-dark-500/30 border-t pt-6 text-center">
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
