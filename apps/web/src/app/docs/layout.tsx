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
import { useEffect, useState } from "react";
import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";
import { Badge } from "~/components/ui/Badge";

// Define sidebar navigation structure
const sidebarItems = [
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

// Sidebar section component with enhanced animations
function SidebarSection({
  section,
  isExpanded,
  onToggle,
  pathname,
}: {
  section: (typeof sidebarItems)[0];
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  return (
    <div className="mb-6">
      <motion.button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 font-medium text-slate-300 transition-all hover:bg-primary-500/10 hover:text-primary-400"
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex items-center">
          <div className="mr-3 h-2 w-2 rounded-full bg-primary-500/60" />
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
                      className={`group flex items-center rounded-lg px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/20"
                          : "text-slate-400 hover:bg-primary-500/10 hover:text-primary-300"
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-500 transition-colors group-hover:bg-primary-400" />
                      {item.title}
                      <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group flex items-center rounded-lg px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/20"
                          : "text-slate-400 hover:bg-primary-500/10 hover:text-primary-300"
                      }`}
                    >
                      <div className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-500 transition-colors group-hover:bg-primary-400" />
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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(
    // Initialize with all sections expanded
    sidebarItems.reduce((acc, section) => {
      // Check if this section contains the active page
      // Expand sections containing active page by default
      // @ts-ignore
      acc[section.title] = section.items.some((item) => item.href === pathname);
      return acc;
    }, {}),
  );

  // Handle scroll effect
  useEffect(() => {
    function handleScroll() {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle section expansion
  const toggleSection = (title: string) => {
    setExpandedSections({
      ...expandedSections,
      [title]: !expandedSections[title],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 text-slate-50">
      <Header />

      <div className="pt-16">
        {/* Enhanced background effects */}
        <div className="-z-10 fixed inset-0 overflow-hidden">
          {/* Animated grid pattern */}
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

          {/* Enhanced gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(138,75,255,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]" />

          {/* Floating orbs with improved animations */}
          <motion.div
            className="absolute top-0 left-0 h-[60vh] w-[60vh] rounded-full bg-primary-500/10"
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
            className="absolute right-0 bottom-0 h-[45vh] w-[45vh] rounded-full bg-cyan-500/8"
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
            className="absolute top-1/2 left-1/3 h-[35vh] w-[35vh] rounded-full bg-purple-500/6"
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

        {/* Enhanced mobile sidebar toggle */}
        <div
          className={`sticky top-16 z-20 flex items-center border-dark-500/30 border-b backdrop-blur-xl transition-all lg:hidden ${
            scrolled
              ? "bg-dark-800/95 shadow-primary-500/5 shadow-xl"
              : "bg-dark-800/60"
          }`}
        >
          <motion.button
            type="button"
            className="px-5 py-4 text-slate-300 transition-colors hover:text-primary-400"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>

          <div className="flex-1 px-4 py-4">
            <div className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary-400" />
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
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-600/60 text-slate-300 transition-all hover:bg-primary-500/20 hover:text-primary-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5" />
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {/* Enhanced sidebar - desktop */}
            <div className="hidden w-72 shrink-0 pr-8 lg:block">
              <div className="sticky top-32 h-screen overflow-y-auto pb-16">
                {/* Sidebar header */}
                <motion.div
                  className="mb-8 pt-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20">
                      <BookOpen className="h-5 w-5 text-primary-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-white">
                        Documentation
                      </h2>
                      <Badge variant="primary" size="xs" className="mt-1">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Alpha
                      </Badge>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation with enhanced styling */}
                <nav className="space-y-2">
                  {sidebarItems.map((section, index) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <SidebarSection
                        section={section}
                        isExpanded={expandedSections[section.title] as boolean}
                        onToggle={() => toggleSection(section.title)}
                        pathname={pathname}
                      />
                    </motion.div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Enhanced mobile sidebar */}
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
                    onClick={() => setIsSidebarOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="fixed inset-y-0 left-0 w-full max-w-sm overflow-y-auto border-dark-500/30 border-r bg-dark-800/95 shadow-2xl backdrop-blur-xl"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between border-dark-500/30 border-b pb-6">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20">
                            <BookOpen className="h-5 w-5 text-primary-400" />
                          </div>
                          <div>
                            <h2 className="font-bold text-lg text-white">
                              Docs
                            </h2>
                            <Badge variant="primary" size="xs">
                              Alpha
                            </Badge>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-dark-600 hover:text-white"
                          onClick={() => setIsSidebarOpen(false)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-6 w-6" />
                        </motion.button>
                      </div>

                      <div className="mt-6 overflow-y-auto">
                        <nav className="space-y-1">
                          {sidebarItems.map((section, index) => (
                            <motion.div
                              key={section.title}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 + 0.2 }}
                            >
                              <SidebarSection
                                section={section}
                                isExpanded={
                                  expandedSections[section.title] as boolean
                                }
                                onToggle={() => toggleSection(section.title)}
                                pathname={pathname}
                              />
                            </motion.div>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced main content */}
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
