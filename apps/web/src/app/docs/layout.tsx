"use client";

import {
  ChevronUp,
  ExternalLink,
  Github,
  Moon,
  Search as SearchIcon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { type ReactNode, useEffect, useState } from "react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Search, type SearchResult } from "@/components/ui/Search";
import { GITHUB_REPO } from "@/utils/constants";

// Sample search data (would be dynamically generated in a real app)
const searchData = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn how to install and set up Nyxo.js",
    category: {
      name: "Documentation",
      icon: <ExternalLink size={16} />,
      type: "documentation",
    },
    url: "/docs/getting-started",
    keywords: ["install", "setup", "introduction", "begin"],
  },
  {
    id: "client-api",
    title: "Client API",
    description: "API reference for the NyxoClient class",
    category: {
      name: "API",
      icon: <ExternalLink size={16} />,
      type: "api",
    },
    url: "/docs/api/client",
    keywords: ["client", "api", "methods", "properties"],
    isNew: true,
  },
  // Additional search entries would go here
];

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({
  children,
}: DocsLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = (): void => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle back to top click
  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle dark/light mode (note: for this design we'd just toggle CSS classes)
  const toggleDarkMode = (): void => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, you'd toggle a CSS class on the body or a context
  };

  return (
    <div className="min-h-screen bg-dark-700">
      <Header />

      {/* Documentation header with search */}
      <div className="border-dark-500 border-b bg-dark-800 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <Search
                fullWidth
                searchData={searchData as unknown as SearchResult[]}
                placeholder="Search documentation..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                href={GITHUB_REPO}
                variant="outline"
                size="sm"
                leadingIcon={<Github className="h-5 w-5" />}
                external
              >
                GitHub
              </Button>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="rounded-lg border border-dark-500 bg-dark-600 p-2 text-slate-300 transition-colors hover:text-primary-400"
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main>{children}</main>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed right-8 bottom-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      <Footer />
    </div>
  );
}
