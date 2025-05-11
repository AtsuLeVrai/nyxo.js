"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

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
}

/**
 * Tabs component for organizing content into selectable tabs
 */
export function Tabs({
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
}: TabsProps) {
  // Find default tab ID or use first tab
  const initialTab =
    defaultTab || ((items.length > 0 ? items[0]?.id : "") as string);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Reference to indicator element for animations
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});

  // Get active tab content
  const activeContent = items.find((item) => item.id === activeTab)?.content;

  /**
   * Handle tab change
   */
  function handleTabChange(tabId: string): void {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      if (onChange) {
        onChange(tabId);
      }
    }
  }

  // Update indicator position when tab changes
  useEffect(() => {
    if (tabsRef.current && variant !== "pill") {
      const tabElement = tabsRef.current.querySelector(
        `[data-tab-id="${activeTab}"]`,
      );

      if (tabElement instanceof HTMLElement) {
        if (orientation === "horizontal") {
          const { offsetLeft, offsetWidth } = tabElement;
          setIndicatorStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
            height: "2px",
            bottom: "0",
          });
        } else {
          const { offsetTop, offsetHeight } = tabElement;
          setIndicatorStyle({
            top: `${offsetTop}px`,
            height: `${offsetHeight}px`,
            width: "2px",
            left: "0",
          });
        }
      }
    }
  }, [activeTab, orientation, variant]);

  // Size styles
  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Padding styles based on size and orientation
  const paddingStyles = {
    horizontal: {
      sm: "px-3 py-1.5",
      md: "px-4 py-2",
      lg: "px-6 py-3",
    },
    vertical: {
      sm: "px-3 py-1.5",
      md: "px-4 py-2",
      lg: "px-5 py-3",
    },
  };

  // Tab variant styles
  const variantStyles = {
    default: "border-dark-500 hover:bg-dark-600/50",
    pill: "rounded-full hover:bg-dark-600/50",
    underline: "border-b border-dark-500 hover:text-primary-400",
  };

  // Active tab styles by variant
  const activeTabStyles = {
    default: "text-primary-400 border-primary-500",
    pill: "bg-primary-500/10 text-primary-400",
    underline: "text-primary-400 border-primary-500",
  };

  // Animation variants for tab content
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div
      className={`flex flex-col ${orientation === "vertical" ? "sm:flex-row" : ""} ${className}`}
    >
      {/* Tab list */}
      <div
        ref={tabsRef}
        className={`relative flex ${
          orientation === "horizontal"
            ? "flex-row overflow-x-auto"
            : "flex-shrink-0 flex-col sm:w-48"
        } ${variant === "default" ? "rounded-lg border border-dark-500" : ""}`}
      >
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            data-tab-id={item.id}
            className={`
              ${sizeStyles[size]}
              ${paddingStyles[orientation][size]}
              ${variantStyles[variant]}
              ${activeTab === item.id ? activeTabStyles[variant] : "text-slate-300"}
              ${tabClassName}font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              ${
                variant === "default" && orientation === "horizontal"
                  ? "border-dark-500 border-r last:border-r-0"
                  : variant === "default" && orientation === "vertical"
                    ? "border-dark-500 border-b last:border-b-0"
                    : ""
              }
            `}
            onClick={() => !item.disabled && handleTabChange(item.id)}
            disabled={item.disabled}
            aria-selected={activeTab === item.id}
            role="tab"
          >
            <div className="flex items-center">
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </div>
          </button>
        ))}

        {/* Animated indicator for default/underline variants */}
        {variant !== "pill" && (
          <motion.div
            className="absolute bg-primary-500"
            style={indicatorStyle}
            layoutId="tabIndicator"
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        )}
      </div>

      {/* Tab content */}
      <div
        className={`mt-4 ${orientation === "vertical" ? "flex-1 sm:mt-0 sm:ml-6" : ""} ${contentClassName}`}
        role="tabpanel"
      >
        {animated ? (
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
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
}
