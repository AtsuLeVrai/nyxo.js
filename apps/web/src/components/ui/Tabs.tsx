"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Tab content */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Aria label for accessibility */
  "aria-label"?: string;
}

export interface TabsProps {
  /** Array of tab items */
  items: TabItem[];
  /** ID of the default active tab */
  defaultTab?: string;
  /** Direction of tabs */
  orientation?: "horizontal" | "vertical";
  /** Size of tabs */
  size?: "sm" | "md" | "lg";
  /** Visual variant */
  variant?: "default" | "pill" | "underline";
  /** Additional class for the container */
  className?: string;
  /** Additional class for tab buttons */
  tabClassName?: string;
  /** Additional class for content area */
  contentClassName?: string;
  /** Function called when tab changes */
  onChange?: (tabId: string) => void;
  /** Whether to animate tab transitions */
  animated?: boolean;
  /** Test ID for testing */
  "data-testid"?: string;
}

/**
 * Enhanced Tabs component with improved accessibility and performance
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      defaultTab,
      orientation = "horizontal",
      size = "md",
      variant = "default",
      className = "",
      tabClassName = "",
      contentClassName = "",
      onChange,
      animated = true,
      "data-testid": testId,
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();

    // Find default tab ID or use first tab
    const initialTab = (defaultTab ||
      (items.length > 0 ? items[0]?.id : "")) as string;
    const [activeTab, setActiveTab] = useState<string>(initialTab);
    const [focusedTab, setFocusedTab] = useState<string>(activeTab);

    // Reference to tabs container for indicator positioning
    const tabsRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>(
      {},
    );

    // Get active tab content
    const activeContent = items.find((item) => item.id === activeTab)?.content;

    /**
     * Handle tab change with validation
     */
    const handleTabChange = useCallback(
      (tabId: string) => {
        const tab = items.find((item) => item.id === tabId);
        if (!tab || tab.disabled || tabId === activeTab) return;

        setActiveTab(tabId);
        setFocusedTab(tabId);
        onChange?.(tabId);
      },
      [items, activeTab, onChange],
    );

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        const currentIndex = items.findIndex((item) => item.id === focusedTab);
        let nextIndex = currentIndex;

        switch (event.key) {
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            break;
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            break;
          case "Home":
            event.preventDefault();
            nextIndex = 0;
            break;
          case "End":
            event.preventDefault();
            nextIndex = items.length - 1;
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            handleTabChange(focusedTab);
            return;
          default:
            return;
        }

        // Skip disabled tabs
        let attempts = 0;
        while (items[nextIndex]?.disabled && attempts < items.length) {
          nextIndex = nextIndex < items.length - 1 ? nextIndex + 1 : 0;
          attempts++;
        }

        if (!items[nextIndex]?.disabled) {
          setFocusedTab(items[nextIndex]?.id as string);
        }
      },
      [items, focusedTab, handleTabChange],
    );

    // Update indicator position when tab changes
    useEffect(() => {
      if (!tabsRef.current || variant === "pill" || shouldReduceMotion) return;

      const tabElement = tabsRef.current.querySelector(
        `[data-tab-id="${activeTab}"]`,
      ) as HTMLElement;

      if (!tabElement) return;

      if (orientation === "horizontal") {
        const { offsetLeft, offsetWidth } = tabElement;
        setIndicatorStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
          height: "2px",
          bottom: "0",
          top: "auto",
        });
      } else {
        const { offsetTop, offsetHeight } = tabElement;
        setIndicatorStyle({
          top: `${offsetTop}px`,
          height: `${offsetHeight}px`,
          width: "2px",
          left: "0",
          bottom: "auto",
        });
      }
    }, [activeTab, orientation, variant, shouldReduceMotion]);

    // Size styles
    const sizeStyles = {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    };

    // Padding styles based on size and orientation
    const paddingStyles = {
      horizontal: {
        sm: "px-3 py-2",
        md: "px-4 py-2.5",
        lg: "px-6 py-3",
      },
      vertical: {
        sm: "px-3 py-2",
        md: "px-4 py-2.5",
        lg: "px-5 py-3",
      },
    };

    // Tab variant styles
    const variantStyles = {
      default: "border-dark-500/50 hover:bg-dark-600/50 transition-colors",
      pill: "rounded-full hover:bg-dark-600/50 transition-colors",
      underline:
        "border-b-2 border-transparent hover:text-primary-400 hover:border-primary-500/50 transition-colors",
    };

    // Active tab styles by variant
    const activeTabStyles = {
      default: "text-primary-400 border-primary-500/50 bg-dark-600/30",
      pill: "bg-primary-500/20 text-primary-400 border border-primary-500/30",
      underline: "text-primary-400 border-primary-500",
    };

    // Animation variants for tab content
    const contentVariants = {
      hidden: {
        opacity: 0,
        y: 10,
        transition: { duration: 0.15 },
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: "easeOut" },
      },
    };

    return (
      <div
        ref={ref}
        className={`flex ${orientation === "vertical" ? "sm:flex-row" : "flex-col"} ${className}`}
        data-testid={testId}
      >
        {/* Tab list */}
        <div
          ref={tabsRef}
          className={`relative flex ${
            orientation === "horizontal"
              ? "scrollbar-hide flex-row overflow-x-auto"
              : "flex-shrink-0 flex-col sm:w-64"
          } ${variant === "default" ? "rounded-lg border border-dark-500/50 bg-dark-700/30" : ""}`}
          role="tablist"
          aria-orientation={orientation}
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => {
            const isActive = activeTab === item.id;
            const isFocused = focusedTab === item.id;

            return (
              <button
                type="button"
                key={item.id}
                data-tab-id={item.id}
                className={`relative flex items-center justify-center ${sizeStyles[size]}
                ${paddingStyles[orientation][size]}
                ${variantStyles[variant]}
                ${isActive ? activeTabStyles[variant] : "text-slate-300"}
                ${tabClassName}font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-800 ${item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                ${
                  variant === "default" && orientation === "horizontal"
                    ? "border-dark-500/50 border-r last:border-r-0"
                    : variant === "default" && orientation === "vertical"
                      ? "border-dark-500/50 border-b last:border-b-0"
                      : ""
                }
                ${isFocused && !item.disabled ? "ring-2 ring-primary-500/50" : ""}
              `}
                onClick={() => handleTabChange(item.id)}
                onFocus={() => setFocusedTab(item.id)}
                disabled={item.disabled}
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.id}`}
                aria-label={item["aria-label"] || item.label}
                id={`tab-${item.id}`}
                role="tab"
                tabIndex={isFocused ? 0 : -1}
              >
                <div className="flex items-center">
                  {item.icon && (
                    <span className="mr-2 flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* Animated indicator for default/underline variants */}
          {variant !== "pill" && !shouldReduceMotion && (
            <motion.div
              className="absolute z-10 bg-primary-500"
              style={indicatorStyle}
              layoutId="tabIndicator"
              transition={{
                duration: 0.25,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
        </div>

        {/* Tab content */}
        <div
          className={`${orientation === "vertical" ? "flex-1 sm:ml-6" : "mt-6"} ${contentClassName}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          id={`tabpanel-${activeTab}`}
        >
          {animated && !shouldReduceMotion ? (
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              {activeContent}
            </motion.div>
          ) : (
            <div>{activeContent}</div>
          )}
        </div>
      </div>
    );
  },
);

Tabs.displayName = "Tabs";
