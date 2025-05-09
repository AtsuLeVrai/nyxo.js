"use client";

import { motion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

export type CardVariant =
  | "default"
  | "elevated"
  | "feature"
  | "testimonial"
  | "pricing";

interface CardProps {
  /** Content to display inside the card */
  children: ReactNode;
  /** Style variant */
  variant?: CardVariant;
  /** Whether the card should be highlighted */
  isHighlighted?: boolean;
  /** Whether to animate the card */
  animate?: boolean;
  /** Additional class names */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Card component for displaying content in a styled container
 */
export function Card({
  children,
  variant = "default",
  isHighlighted = false,
  animate = true,
  className = "",
  onClick,
}: CardProps): ReactElement {
  // Base styles for all cards
  const baseStyles = "rounded-lg overflow-hidden";

  // Specific styles for each variant
  const variantStyles: Record<CardVariant, string> = {
    default: "border border-dark-500 bg-dark-600",
    elevated: "border border-dark-500 bg-dark-600 shadow-lg",
    feature: "border border-dark-500 bg-dark-600",
    testimonial: "border border-dark-500 bg-dark-600 p-6",
    pricing: "border border-dark-500 bg-dark-600",
  };

  // Highlighted styles
  const highlightedStyles = isHighlighted
    ? "border-primary-500/30 shadow-lg shadow-primary-500/20"
    : "";

  // Animation properties
  const animationProps = animate
    ? {
        whileHover: {
          y: -5,
          transition: { duration: 0.3 },
        },
        animate: { opacity: 1, y: 0 },
        initial: { opacity: 0, y: 15 },
        transition: { duration: 0.5 },
      }
    : {};

  // Combine all styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${highlightedStyles}
    ${className}
  `;

  /**
   * Render a card with gradient border if highlighted
   */
  function renderCardWithGradient() {
    if (isHighlighted) {
      return (
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 opacity-75 blur-sm" />
          <div className={combinedStyles}>{children}</div>
        </div>
      );
    }

    return <div className={combinedStyles}>{children}</div>;
  }

  // Return with or without animation
  if (animate) {
    return (
      <motion.div
        className="relative"
        {...animationProps}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {renderCardWithGradient()}
      </motion.div>
    );
  }

  return (
    <div
      className="relative"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {renderCardWithGradient()}
    </div>
  );
}

/**
 * Card header subcomponent
 */
Card.Header = function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

/**
 * Card body subcomponent
 */
Card.Body = function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

/**
 * Card footer subcomponent
 */
Card.Footer = function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return <div className={`bg-dark-700/50 p-6 ${className}`}>{children}</div>;
};

/**
 * Card title subcomponent
 */
Card.Title = function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <h3 className={`font-medium text-lg text-white ${className}`}>
      {children}
    </h3>
  );
};

/**
 * Card description subcomponent
 */
Card.Description = function CardDescription({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return <p className={`text-slate-400 ${className}`}>{children}</p>;
};
