"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "~/components/layout/Footer";
import Header from "~/components/layout/Header";

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

// Sidebar section component
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
        className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-dark-600/50 hover:text-primary-400"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span>{section.title}</span>
        <motion.div
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            className="mt-2 space-y-1 pl-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {section.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      className={`flex items-center rounded-md px-3 py-1.5 text-sm ${
                        isActive
                          ? "bg-primary-500/10 text-primary-400"
                          : "text-slate-400 hover:bg-dark-600/30 hover:text-primary-400"
                      } transition-colors`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                      <ExternalLink className="ml-1.5 h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block rounded-md px-3 py-1.5 text-sm ${
                        isActive
                          ? "bg-primary-500/10 text-primary-400"
                          : "text-slate-400 hover:bg-dark-600/30 hover:text-primary-400"
                      } transition-colors`}
                    >
                      {item.title}
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
    <div className="min-h-screen bg-gradient-to-b from-dark-800 to-dark-900 text-slate-50">
      <Header />

      <div className="pt-16">
        {/* Background effects */}
        <div className="-z-10 fixed inset-0 overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(138,75,255,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(138,75,255,0.07),transparent_70%)]" />

          {/* Orbs */}
          <motion.div
            className="absolute top-0 left-0 h-[40vh] w-[40vh] rounded-full bg-primary-500/10"
            style={{ filter: "blur(100px)" }}
            animate={{
              x: ["-25%", "5%", "-25%"],
              y: ["-25%", "10%", "-25%"],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-0 bottom-0 h-[35vh] w-[35vh] rounded-full bg-purple-600/10"
            style={{ filter: "blur(120px)" }}
            animate={{
              x: ["25%", "-5%", "25%"],
              y: ["25%", "-10%", "25%"],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Mobile sidebar toggle */}
        <div
          className={`sticky top-16 z-20 flex items-center border-dark-500 border-b backdrop-blur-md transition-all lg:hidden ${
            scrolled ? "bg-dark-800/90 shadow-lg" : "bg-dark-800/50"
          }`}
        >
          <motion.button
            type="button"
            className="px-4 py-3 text-slate-300 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>

          <div className="flex-1 px-4 py-3 font-medium text-slate-300">
            Documentation
          </div>

          <div className="px-4">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-600 text-slate-300 hover:bg-dark-500 hover:text-primary-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5" />
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {/* Sidebar - desktop */}
            <div className="hidden w-64 shrink-0 border-dark-500/50 border-r pr-8 lg:block">
              <div className="sticky top-32 h-screen overflow-y-auto pb-16">
                <nav className="pt-6">
                  {sidebarItems.map((section) => (
                    <SidebarSection
                      key={section.title}
                      section={section}
                      isExpanded={expandedSections[section.title] as boolean}
                      onToggle={() => toggleSection(section.title)}
                      pathname={pathname}
                    />
                  ))}
                </nav>
              </div>
            </div>

            {/* Mobile sidebar */}
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
                    className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="fixed inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-dark-800 p-6 shadow-xl"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between pb-4">
                      <motion.h2
                        className="font-bold text-lg text-primary-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Nyxo.js Docs
                      </motion.h2>
                      <motion.button
                        type="button"
                        className="rounded p-1 text-slate-400 hover:bg-dark-600 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="h-6 w-6" />
                      </motion.button>
                    </div>

                    <div className="mt-6 overflow-y-auto">
                      <nav>
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content */}
            <motion.main
              className="w-full py-10 lg:py-16 lg:pl-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="prose prose-invert max-w-3xl">{children}</div>
            </motion.main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
