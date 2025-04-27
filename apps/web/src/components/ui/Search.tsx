"use client";

import { Badge } from "@/components/ui/Badge";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Code,
  Command,
  File,
  Search as SearchIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

// Types for search items
interface SearchCategory {
  name: string;
  icon: React.ReactNode;
  type: "documentation" | "api" | "examples" | "guides";
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: SearchCategory;
  url: string;
  keywords?: string[];
  isNew?: boolean;
}

interface SearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  fullWidth?: boolean;
  searchData?: SearchResult[];
  hotkey?: string;
}

const defaultCategories: SearchCategory[] = [
  { name: "Documentation", icon: <File size={16} />, type: "documentation" },
  { name: "API", icon: <Code size={16} />, type: "api" },
  { name: "Examples", icon: <Command size={16} />, type: "examples" },
  { name: "Guides", icon: <Bookmark size={16} />, type: "guides" },
];

export function Search({
  placeholder = "Search documentation...",
  className = "",
  onSearch,
  fullWidth = false,
  searchData = [],
  hotkey = "/",
}: SearchProps): React.ReactElement {
  const [query, setQuery] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Register keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === hotkey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setIsActive(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown as any);

    return () => {
      window.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [hotkey]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to filter search results
  const filterSearchResults = (searchTerm: string): SearchResult[] => {
    if (!searchTerm.trim()) return [];

    const lowercaseQuery = searchTerm.toLowerCase().trim();

    return searchData
      .filter((item) => {
        // Check title
        if (item.title.toLowerCase().includes(lowercaseQuery)) return true;

        // Check description
        if (item.description?.toLowerCase().includes(lowercaseQuery))
          return true;

        // Check keywords
        if (
          item.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(lowercaseQuery),
          )
        )
          return true;

        return false;
      })
      .slice(0, 8); // Limit results to prevent overwhelming the UI
  };

  // Update search results when query changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (query) {
      const results = filterSearchResults(query);
      setSearchResults(results);
      setSelectedIndex(results.length > 0 ? 0 : -1);
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
    }

    // Notify parent component
    onSearch?.(query);
  }, [query, onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selectedResult = searchResults[selectedIndex];
      if (selectedResult) {
        window.location.href = selectedResult.url;
      }
    } else if (e.key === "Escape") {
      setIsActive(false);
      inputRef.current?.blur();
    }
  };

  // Group results by category
  const groupedResults: Record<string, SearchResult[]> = {};

  for (const result of searchResults) {
    const category = result.category.type;
    if (!groupedResults[category]) {
      groupedResults[category] = [];
    }
    groupedResults[category].push(result);
  }

  return (
    <div
      className={`relative ${fullWidth ? "w-full" : "max-w-lg"} ${className}`}
    >
      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsActive(true)}
          onKeyDown={handleKeyDown}
          className={
            "block w-full rounded-lg border border-dark-500 bg-dark-600 py-3 pr-12 pl-10 text-slate-300 placeholder-slate-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 "
          }
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <kbd className="hidden items-center rounded border border-dark-500 bg-dark-700 px-2 text-slate-400 text-xs sm:flex">
              {hotkey}
            </kbd>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      <AnimatePresence>
        {isActive && searchResults.length > 0 && (
          <motion.div
            ref={resultsRef}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-dark-500 bg-dark-700 shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {Object.entries(groupedResults).map(([category, results]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="mb-2 px-3 py-1 font-medium text-slate-400 text-xs uppercase">
                    {defaultCategories.find((c) => c.type === category)?.name ||
                      "Results"}
                  </div>

                  <div className="space-y-1">
                    {results.map((result, index) => {
                      const isSelected =
                        selectedIndex === searchResults.indexOf(result);

                      return (
                        <Link
                          key={result.id}
                          href={result.url}
                          className={`flex items-center rounded-md px-3 py-2 ${
                            isSelected
                              ? "bg-primary-500/20 text-primary-400"
                              : "text-slate-300 hover:bg-dark-600"
                          }transition-colors duration-100 `}
                        >
                          <div className="mr-3 text-primary-400">
                            {result.category.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <div className="truncate font-medium">
                                {result.title}
                              </div>

                              {result.isNew && (
                                <Badge
                                  variant="success"
                                  size="xs"
                                  className="ml-2"
                                >
                                  New
                                </Badge>
                              )}
                            </div>

                            {result.description && (
                              <div className="truncate text-slate-400 text-xs">
                                {result.description}
                              </div>
                            )}
                          </div>

                          <div className="ml-2 text-slate-400">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with hint text */}
            <div className="border-dark-500 border-t bg-dark-600 px-3 py-2 text-slate-400 text-xs">
              <div className="flex items-center justify-between">
                <span>
                  Press{" "}
                  <kbd className="rounded bg-dark-500 px-1.5 py-0.5 text-slate-300">
                    ↑
                  </kbd>{" "}
                  <kbd className="rounded bg-dark-500 px-1.5 py-0.5 text-slate-300">
                    ↓
                  </kbd>{" "}
                  to navigate
                </span>
                <span>
                  Press{" "}
                  <kbd className="rounded bg-dark-500 px-1.5 py-0.5 text-slate-300">
                    Enter
                  </kbd>{" "}
                  to select
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {isActive && query && searchResults.length === 0 && (
          <motion.div
            className="absolute z-50 mt-2 w-full rounded-lg border border-dark-500 bg-dark-700 p-4 text-center shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-slate-300">
              No results found for "
              <span className="text-primary-400">{query}</span>"
            </div>
            <div className="mt-1 text-slate-400 text-sm">
              Try using different keywords or check the spelling
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
