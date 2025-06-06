"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

export type CardVariant =
  | "default"
  | "elevated"
  | "feature"
  | "testimonial"
  | "pricing";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
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
  /** Whether the card is interactive (clickable) */
  interactive?: boolean;
  /** Test ID for testing */
  "data-testid"?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      isHighlighted = false,
      animate = true,
      className = "",
      onClick,
      interactive = false,
      "data-testid": testId,
      ...rest
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const isClickable = onClick || interactive;

    // Base styles for all cards
    const baseStyles = "rounded-lg overflow-hidden transition-all duration-200";

    // Specific styles for each variant with improved contrast
    const variantStyles: Record<CardVariant, string> = {
      default: "border border-dark-500 bg-dark-600/80 backdrop-blur-sm",
      elevated:
        "border border-dark-500 bg-dark-600/80 shadow-lg shadow-black/20 backdrop-blur-sm",
      feature:
        "border border-dark-500 bg-dark-600/80 backdrop-blur-sm hover:border-dark-400 transition-colors",
      testimonial: "border border-dark-500 bg-dark-600/80 p-6 backdrop-blur-sm",
      pricing: "border border-dark-500 bg-dark-600/80 backdrop-blur-sm",
    };

    // Highlighted styles with better visual feedback
    const highlightedStyles = isHighlighted
      ? "border-primary-500/50 shadow-lg shadow-primary-500/20 bg-dark-600/90"
      : "";

    // Interactive styles
    const interactiveStyles = isClickable
      ? "cursor-pointer hover:border-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-800"
      : "";

    // Combine all styles
    const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${highlightedStyles}
    ${interactiveStyles}
    ${className}
  `;

    // Animation properties with reduced motion support
    const animationProps =
      animate && !shouldReduceMotion
        ? {
            whileHover: isClickable
              ? {
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }
              : {
                  y: -2,
                  transition: { duration: 0.2, ease: "easeOut" },
                },
            animate: { opacity: 1, y: 0 },
            initial: { opacity: 0, y: 15 },
            transition: { duration: 0.4, ease: "easeOut" },
            whileTap: isClickable ? { scale: 0.98 } : undefined,
          }
        : {};

    // Handle keyboard events for accessibility
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (onClick && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick();
      }
    };

    /**
     * Render a card with gradient border if highlighted
     */
    function CardContent() {
      if (isHighlighted) {
        return (
          <div className="group relative">
            <div className="-inset-0.5 absolute rounded-lg bg-gradient-to-r from-primary-500 to-cyan-500 opacity-60 blur-sm transition-opacity group-hover:opacity-80" />
            <div className={`relative ${combinedStyles}`}>{children}</div>
          </div>
        );
      }

      return <div className={combinedStyles}>{children}</div>;
    }

    // Return with or without animation
    if (animate && !shouldReduceMotion) {
      return (
        // @ts-ignore
        <motion.div
          ref={ref}
          className="relative"
          {...animationProps}
          onClick={onClick}
          onKeyDown={isClickable ? handleKeyDown : undefined}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          aria-pressed={isClickable ? false : undefined}
          data-testid={testId}
          {...rest}
        >
          <CardContent />
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className="relative"
        onClick={onClick}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-pressed={isClickable ? false : undefined}
        data-testid={testId}
        {...rest}
      >
        <CardContent />
      </div>
    );
  },
);

Card.displayName = "Card";

/**
 * Card header subcomponent
 */
const CardHeader = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
  }
>(({ children, className = "" }, ref) => {
  return (
    <div ref={ref} className={`p-6 ${className}`}>
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

/**
 * Card body subcomponent
 */
const CardBody = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
  }
>(({ children, className = "" }, ref) => {
  return (
    <div ref={ref} className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
});
CardBody.displayName = "CardBody";

/**
 * Card footer subcomponent
 */
const CardFooter = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
  }
>(({ children, className = "" }, ref) => {
  return (
    <div
      ref={ref}
      className={`border-dark-500/50 border-t bg-dark-700/30 p-6 ${className}`}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = "CardFooter";

/**
 * Card title subcomponent
 */
const CardTitle = forwardRef<
  HTMLHeadingElement,
  {
    children: ReactNode;
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ children, className = "", as: Component = "h3" }, ref) => {
  return (
    <Component
      ref={ref}
      className={`font-semibold text-lg text-white leading-tight ${className}`}
    >
      {children}
    </Component>
  );
});
CardTitle.displayName = "CardTitle";

/**
 * Card description subcomponent
 */
const CardDescription = forwardRef<
  HTMLParagraphElement,
  {
    children: ReactNode;
    className?: string;
  }
>(({ children, className = "" }, ref) => {
  return (
    <p ref={ref} className={`text-slate-400 leading-relaxed ${className}`}>
      {children}
    </p>
  );
});
CardDescription.displayName = "CardDescription";

// Attach subcomponents to main Card component
// @ts-ignore
Card.Header = CardHeader;
// @ts-ignore
Card.Body = CardBody;
// @ts-ignore
Card.Footer = CardFooter;
// @ts-ignore
Card.Title = CardTitle;
// @ts-ignore
Card.Description = CardDescription;
