"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";
import { cloneElement, forwardRef, isValidElement } from "react";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";
export type BadgeSize = "xs" | "sm" | "md" | "lg";

export interface BadgeProps {
  /** Content to display inside the badge */
  children: ReactNode;
  /** Style variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Optional icon to display */
  icon?: ReactElement;
  /** Additional class names */
  className?: string;
  /** Whether to animate the badge entry */
  animated?: boolean;
  /** Whether to use pill styling (rounded corners) */
  pill?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Whether the badge is disabled */
  disabled?: boolean;
  /** ARIA label for accessibility */
  "aria-label"?: string;
  /** Test ID for testing */
  "data-testid"?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "primary",
      size = "sm",
      icon,
      className = "",
      animated = false,
      pill = true,
      onClick,
      disabled = false,
      "aria-label": ariaLabel,
      "data-testid": testId,
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();

    // Define variant styles with better contrast
    const variantStyles: Record<BadgeVariant, string> = {
      primary:
        "border-primary-500/30 bg-primary-500/15 text-primary-300 hover:bg-primary-500/20",
      success:
        "border-green-500/30 bg-green-500/15 text-green-300 hover:bg-green-500/20",
      warning:
        "border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/20",
      danger:
        "border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/20",
      neutral:
        "border-slate-500/30 bg-slate-500/15 text-slate-300 hover:bg-slate-500/20",
      info: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/20",
    };

    // Define size styles with better proportions
    const sizeStyles: Record<BadgeSize, string> = {
      xs: "px-1.5 py-0.5 text-xs min-h-[20px]",
      sm: "px-2 py-1 text-xs min-h-[24px]",
      md: "px-3 py-1.5 text-sm min-h-[28px]",
      lg: "px-4 py-2 text-sm min-h-[32px]",
    };

    // Get the appropriate icon size based on badge size
    function getIconSize(size: BadgeSize): number {
      switch (size) {
        case "xs":
          return 12;
        case "sm":
          return 14;
        case "md":
          return 16;
        case "lg":
          return 18;
        default:
          return 14;
      }
    }

    // Prepare the icon element if provided
    const iconElement =
      icon && isValidElement(icon)
        ? cloneElement(icon, {
            // @ts-expect-error - React element props
            size: getIconSize(size),
            className: "flex-shrink-0 mr-1.5",
            "aria-hidden": true,
          })
        : null;

    // Create the base badge styles
    const baseStyles = `
    inline-flex items-center justify-center
    border font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${pill ? "rounded-full" : "rounded-md"}
    ${onClick ? "cursor-pointer hover:scale-105 focus:ring-primary-500/50" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
    ${className}
  `;

    // Define animation variants for framer-motion
    const animationVariants = {
      initial: {
        scale: 0.8,
        opacity: 0,
        transition: { duration: 0.2 },
      },
      animate: {
        scale: 1,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 30,
          duration: 0.3,
        },
      },
      hover: {
        scale: onClick && !disabled ? 1.05 : 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10,
        },
      },
      tap: {
        scale: onClick && !disabled ? 0.95 : 1,
        transition: { duration: 0.1 },
      },
    };

    // Handle keyboard events
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (
        onClick &&
        !disabled &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        onClick();
      }
    };

    // Return animated or static badge based on props
    if (animated && !shouldReduceMotion) {
      return (
        <motion.span
          ref={ref}
          className={baseStyles}
          initial="initial"
          animate="animate"
          whileHover={onClick && !disabled ? "hover" : undefined}
          whileTap={onClick && !disabled ? "tap" : undefined}
          variants={animationVariants}
          onClick={disabled ? undefined : onClick}
          onKeyDown={onClick ? handleKeyDown : undefined}
          role={onClick ? "button" : undefined}
          tabIndex={onClick && !disabled ? 0 : undefined}
          aria-label={ariaLabel}
          aria-disabled={disabled}
          data-testid={testId}
        >
          {iconElement}
          <span className="truncate">{children}</span>
        </motion.span>
      );
    }

    return (
      <span
        ref={ref}
        className={baseStyles}
        onClick={disabled ? undefined : onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? "button" : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        data-testid={testId}
      >
        {iconElement}
        <span className="truncate">{children}</span>
      </span>
    );
  },
);

Badge.displayName = "Badge";
