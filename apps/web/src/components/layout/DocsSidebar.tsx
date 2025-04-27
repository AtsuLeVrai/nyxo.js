"use client";

import { Badge } from "@/components/ui/Badge";
import { AnimatePresence, motion } from "framer-motion";
import {
  Book,
  ChevronDown,
  ChevronRight,
  Code,
  Command,
  FileText,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

// Types for documentation structure
interface DocLink {
  title: string;
  href: string;
  status?: "new" | "updated" | "deprecated";
}

interface DocCategory {
  title: string;
  icon: React.ReactNode;
  items: DocLink[];
}

// Documentation menu structure
const docCategories: DocCategory[] = [
  {
    title: "Getting Started",
    icon: <Book className="h-5 w-5" />,
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/getting-started/installation" },
      { title: "Quick Start", href: "/docs/getting-started/quick-start" },
      {
        title: "Configuration",
        href: "/docs/getting-started/configuration",
        status: "updated",
      },
    ],
  },
  {
    title: "Core Concepts",
    icon: <Lightbulb className="h-5 w-5" />,
    items: [
      { title: "Client", href: "/docs/core-concepts/client" },
      { title: "Commands", href: "/docs/core-concepts/commands" },
      { title: "Events", href: "/docs/core-concepts/events" },
      {
        title: "Error Handling",
        href: "/docs/core-concepts/error-handling",
        status: "new",
      },
    ],
  },
  {
    title: "Advanced Usage",
    icon: <Code className="h-5 w-5" />,
    items: [
      { title: "Middleware", href: "/docs/advanced/middleware" },
      { title: "Custom Structures", href: "/docs/advanced/custom-structures" },
      { title: "Plugins", href: "/docs/advanced/plugins", status: "new" },
      { title: "TypeScript Features", href: "/docs/advanced/typescript" },
    ],
  },
  {
    title: "API Reference",
    icon: <FileText className="h-5 w-5" />,
    items: [
      { title: "Client API", href: "/docs/api/client" },
      { title: "Command API", href: "/docs/api/command" },
      { title: "Event API", href: "/docs/api/event" },
      { title: "Utility Functions", href: "/docs/api/utils" },
    ],
  },
  {
    title: "Examples",
    icon: <Command className="h-5 w-5" />,
    items: [
      { title: "Basic Bot", href: "/docs/examples/basic-bot" },
      { title: "Slash Commands", href: "/docs/examples/slash-commands" },
      { title: "Event Handlers", href: "/docs/examples/event-handlers" },
      {
        title: "Database Integration",
        href: "/docs/examples/database",
        status: "new",
      },
    ],
  },
];

export function DocsSidebar({
  className = "",
}: { className?: string }): React.ReactElement {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Initialize expanded categories based on current path
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};

    for (const category of docCategories) {
      // Expand the category if it contains the current path
      initialExpanded[category.title] = category.items.some((item) =>
        pathname.includes(item.href),
      );
    }

    setExpandedCategories(initialExpanded);
  }, [pathname]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Toggle a category's expanded state
  const toggleCategory = (categoryTitle: string): void => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle],
    }));
  };

  // Toggle mobile menu
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if a link is the current page
  const isActiveLink = (href: string): boolean => pathname === href;

  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  // Render sidebar content
  const sidebarContent = (
    <motion.div
      className={`${className} py-6`}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="mb-6 px-4 font-bold text-slate-50 text-xl">
        Documentation
      </h2>
      <div className="space-y-4">
        {docCategories.map((category, index) => (
          <motion.div
            key={category.title}
            variants={categoryVariants}
            custom={index}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-2 text-left text-slate-300 hover:text-primary-400"
              onClick={() => toggleCategory(category.title)}
            >
              <div className="flex items-center">
                <span className="mr-2 text-primary-400">{category.icon}</span>
                <span className="font-medium">{category.title}</span>
              </div>
              {expandedCategories[category.title] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            <AnimatePresence>
              {expandedCategories[category.title] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {category.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-8 py-2 text-sm ${
                          isActiveLink(item.href)
                            ? "border-primary-500 border-l-2 bg-primary-500/10 text-primary-400"
                            : "text-slate-400 hover:bg-dark-600 hover:text-primary-300"
                        }`}
                      >
                        <span>{item.title}</span>
                        {item.status && (
                          <Badge
                            variant={
                              item.status === "new"
                                ? "success"
                                : item.status === "updated"
                                  ? "warning"
                                  : "danger"
                            }
                            size="xs"
                            className="ml-2"
                          >
                            {item.status}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // Mobile menu button
  const mobileMenuButton = (
    <button
      type="button"
      className="flex items-center rounded-md border border-dark-500 bg-dark-600 px-4 py-2 text-slate-300 lg:hidden"
      onClick={toggleMobileMenu}
    >
      <span className="mr-2">Documentation Menu</span>
      {isMobileMenuOpen ? (
        <ChevronDown className="h-5 w-5" />
      ) : (
        <ChevronRight className="h-5 w-5" />
      )}
    </button>
  );

  // Render mobile or desktop version
  if (isMobile) {
    return (
      <div className="mb-6">
        {mobileMenuButton}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="mt-2 overflow-hidden rounded-md border border-dark-500 bg-dark-600"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {sidebarContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop version
  return (
    <div className={`${className} h-full overflow-auto`}>{sidebarContent}</div>
  );
}
