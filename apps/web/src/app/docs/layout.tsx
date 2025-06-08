"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import { Badge } from "~/components/ui/Badge";

interface SidebarItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_ITEMS: SidebarSection[] = [
  {
    title: "Introduction",
    items: [
      { title: "Get Started", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Core Concepts", href: "/docs/core-concepts" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Basic Bot", href: "/docs/guides/basic-bot" },
      { title: "Command Handling", href: "/docs/guides/command-handling" },
      { title: "Event Handling", href: "/docs/guides/event-handling" },
      { title: "Error Handling", href: "/docs/guides/error-handling" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Client", href: "/docs/api/client" },
      { title: "Commands", href: "/docs/api/commands" },
      { title: "Events", href: "/docs/api/events" },
      { title: "Utilities", href: "/docs/api/utilities" },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "Basic Examples", href: "/docs/examples/basic" },
      { title: "Advanced Use Cases", href: "/docs/examples/advanced" },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Discord Server",
        href: "https://discord.gg/hfMzQMbaMg",
        isExternal: true,
      },
      {
        title: "GitHub Repository",
        href: "https://github.com/AtsuLeVrai/nyxo.js",
        isExternal: true,
      },
      { title: "Contributing", href: "/docs/contributing" },
    ],
  },
];

interface SidebarSectionProps {
  section: SidebarSection;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
}

function SidebarSection({
  section,
  isExpanded,
  onToggle,
  pathname,
}: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <motion.button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-medium text-slate-300 transition-all hover:bg-primary-500/10 hover:text-primary-300 focus:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        whileHover={{ scale: 1.01, x: 2 }}
        whileTap={{ scale: 0.99 }}
        aria-expanded={isExpanded}
        aria-controls={`section-${section.title}`}
      >
        <span className="flex items-center">
          <div className="mr-3 h-2 w-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500" />
          {section.title}
        </span>
        <motion.div
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            id={`section-${section.title}`}
            className="mt-3 space-y-1 pl-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {section.items.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      className={`group flex items-center rounded-xl px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/20"
                          : "text-slate-400 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:text-primary-300"
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-500 transition-all group-hover:bg-primary-400" />
                      {item.title}
                      <ExternalLink
                        className="ml-auto h-3 w-3 opacity-60"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group flex items-center rounded-xl px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/20"
                          : "text-slate-400 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-primary-600/10 hover:text-primary-300"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-500 transition-all group-hover:bg-primary-400" />
                      {item.title}
                      {isActive && (
                        <motion.div
                          className="ml-auto h-2 w-2 rounded-full bg-primary-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const initialExpandedSections = useMemo(
    () =>
      SIDEBAR_ITEMS.reduce(
        (acc, section) => {
          acc[section.title] = section.items.some(
            (item) => item.href === pathname,
          );
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    [pathname],
  );

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(initialExpandedSections);

  const toggleSection = useCallback((title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, closeSidebar]);

  useEffect(() => {
    closeSidebar();
  }, [closeSidebar]);

  const backgroundElements = useMemo(
    () => (
      <div className="-z-10 fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5"
          animate={{
            backgroundPosition: ["0px 0px", "40px 40px", "0px 0px"],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.04),transparent_70%)]" />

        <motion.div
          className="absolute top-0 left-0 h-[60vh] w-[60vh] rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10"
          style={{ filter: "blur(120px)" }}
          animate={{
            x: ["-30%", "10%", "-30%"],
            y: ["-30%", "15%", "-30%"],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-0 bottom-0 h-[45vh] w-[45vh] rounded-full bg-gradient-to-r from-cyan-500/8 to-blue-500/8"
          style={{ filter: "blur(100px)" }}
          animate={{
            x: ["30%", "-10%", "30%"],
            y: ["30%", "-15%", "30%"],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 h-[35vh] w-[35vh] rounded-full bg-gradient-to-r from-purple-500/6 to-pink-500/6"
          style={{ filter: "blur(90px)" }}
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["-20%", "20%", "-20%"],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 35,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
    ),
    [],
  );

  const sidebarHeader = useMemo(
    () => (
      <motion.div
        className="mb-8 pt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-center">
          <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500/20 to-purple-500/20 shadow-lg shadow-primary-500/20">
            <BookOpen className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text font-bold text-lg text-transparent">
              Documentation
            </h2>
            <Badge variant="primary" size="xs" className="mt-1">
              <Sparkles className="mr-1 h-3 w-3" />
              Alpha
            </Badge>
          </div>
        </div>
      </motion.div>
    ),
    [],
  );

  const sidebarNavigation = useMemo(
    () => (
      <nav className="space-y-2" aria-label="Documentation navigation">
        {SIDEBAR_ITEMS.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SidebarSection
              section={section}
              isExpanded={expandedSections[section.title] ?? false}
              onToggle={() => toggleSection(section.title)}
              pathname={pathname}
            />
          </motion.div>
        ))}
      </nav>
    ),
    [expandedSections, pathname, toggleSection],
  );

  return (
    <div className="min-h-screen bg-dark-800 text-slate-50">
      <Header />

      <div className="pt-16">
        {backgroundElements}

        <div
          className={`sticky top-16 z-20 flex items-center border-dark-500/30 border-b backdrop-blur-xl transition-all lg:hidden ${
            scrolled
              ? "bg-dark-800/95 shadow-lg shadow-primary-500/5"
              : "bg-dark-800/80"
          }`}
        >
          <motion.button
            type="button"
            className="px-5 py-4 text-slate-300 transition-colors hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            onClick={toggleSidebar}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>

          <div className="flex-1 px-4 py-4">
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500/20 to-purple-500/20">
                <BookOpen className="h-4 w-4 text-primary-400" />
              </div>
              <span className="font-semibold text-slate-200">
                Documentation
              </span>
              <Badge variant="primary" size="xs" className="ml-2">
                <Sparkles className="mr-1 h-3 w-3" />
                Alpha
              </Badge>
            </div>
          </div>

          <div className="px-4">
            <motion.button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-600/60 text-slate-300 transition-all hover:bg-primary-500/20 hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Search documentation"
            >
              <Search className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <aside className="hidden w-72 shrink-0 pr-8 lg:block">
              <div className="sticky top-32 h-screen overflow-y-auto pb-16">
                {sidebarHeader}
                {sidebarNavigation}
              </div>
            </aside>

            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  className="fixed inset-0 z-40 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="fixed inset-0 bg-dark-900/95 backdrop-blur-md"
                    onClick={closeSidebar}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.aside
                    className="fixed inset-y-0 left-0 w-full max-w-sm overflow-y-auto border-dark-500/30 border-r bg-dark-800/95 shadow-2xl backdrop-blur-xl"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between border-dark-500/30 border-b pb-6">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500/20 to-purple-500/20 shadow-lg shadow-primary-500/20">
                            <BookOpen className="h-6 w-6 text-primary-400" />
                          </div>
                          <div>
                            <h2 className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text font-bold text-lg text-transparent">
                              Docs
                            </h2>
                            <Badge variant="primary" size="xs">
                              Alpha
                            </Badge>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-dark-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          onClick={closeSidebar}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Close sidebar"
                        >
                          <X className="h-6 w-6" />
                        </motion.button>
                      </div>

                      <div className="mt-6 overflow-y-auto">
                        <nav
                          className="space-y-1"
                          aria-label="Mobile documentation navigation"
                        >
                          {SIDEBAR_ITEMS.map((section, index) => (
                            <motion.div
                              key={section.title}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 + 0.2 }}
                            >
                              <SidebarSection
                                section={section}
                                isExpanded={
                                  expandedSections[section.title] ?? false
                                }
                                onToggle={() => toggleSection(section.title)}
                                pathname={pathname}
                              />
                            </motion.div>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.main
              className="w-full py-10 lg:py-16 lg:pl-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="prose prose-invert max-w-4xl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {children}
                </motion.div>
              </div>
            </motion.main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
