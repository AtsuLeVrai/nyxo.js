"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO, NAV_LINKS } from "~/utils/constants";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [theme, setTheme] = useState("dark");
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

  // Theme toggle (placeholder - would need actual implementation)
  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  // Check if a link is active based on the current path
  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <motion.nav
      className={`fixed z-50 w-full backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "border-dark-500 border-b bg-dark-800/90 shadow-lg shadow-primary-500/5"
          : "bg-transparent"
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
              <motion.div
                className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(138, 75, 255, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
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
                  <motion.path
                    d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z"
                    fill="currentColor"
                    className="text-primary-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                </svg>
              </motion.div>
              <motion.span
                className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text font-bold text-2xl text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Nyxo.js
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation - Now centered */}
          <div className="flex flex-1 justify-center">
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="group relative px-3 py-2 font-medium text-sm transition-colors"
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
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
                        <ExternalLink className="ml-1 h-3 w-3" />
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
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            {/* Theme Toggle */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-600/50 text-slate-300 hover:bg-dark-500 hover:text-primary-400"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

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
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-10 overflow-hidden md:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="relative h-full overflow-y-auto px-4 pt-16 pb-12">
              {/* Close button */}
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-400 hover:text-white"
                  onClick={toggleMenu}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile search */}
              <div className="mt-4 mb-6">
                <div className="relative">
                  <div className="flex h-12 items-center rounded-lg border border-dark-500 bg-dark-800/90">
                    <div className="flex h-full items-center pl-4 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search documentation..."
                      className="h-full w-full bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile nav links - Now centered */}
              <div className="space-y-1 py-2">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`block flex items-center justify-center rounded-lg px-4 py-3 font-medium text-lg ${
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
                  </motion.div>
                ))}
              </div>

              {/* Mobile theme toggle */}
              <div className="mt-6 flex items-center border-dark-500 border-t py-4">
                <div className="text-slate-400">Appearance</div>
                <div className="ml-auto">
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-full border border-dark-500 bg-dark-700 p-2 text-slate-300"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile action buttons */}
              <div className="mt-8 space-y-4">
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
