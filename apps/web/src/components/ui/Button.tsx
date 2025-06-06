"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import { cloneElement, forwardRef, isValidElement } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface BaseButtonProps {
  /** Content to display inside the button */
  children: ReactNode;
  /** Style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Additional class names */
  className?: string;
  /** Optional icon to display before text */
  leadingIcon?: ReactElement;
  /** Optional icon to display after text */
  trailingIcon?: ReactElement;
  /** Whether to make the button full width */
  fullWidth?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading state */
  loading?: boolean;
  /** Border radius style */
  rounded?: "default" | "full" | "none";
  /** Whether to animate the button */
  animated?: boolean;
  /** Test ID for testing */
  "data-testid"?: string;
}

interface ButtonAsButtonProps
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  /** HTML button type */
  type?: "button" | "submit" | "reset";
  /** Click handler */
  onClick?: () => void;
  href?: never;
  external?: never;
}

interface ButtonAsLinkProps
  extends BaseButtonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  /** URL for link buttons */
  href: string;
  /** Whether the link should open in a new tab */
  external?: boolean;
  type?: never;
  onClick?: never;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      disabled = false,
      loading = false,
      rounded = "default",
      animated = true,
      "data-testid": testId,
      ...rest
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const isLink = "href" in rest;
    const external = isLink ? rest.external : false;

    // Define base styles based on variant with improved contrast
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500/50",
      secondary:
        "bg-dark-600/50 text-primary-400 border border-dark-500 hover:border-primary-500/50 hover:text-primary-300 hover:bg-dark-500/50 focus:ring-primary-500/50",
      outline:
        "border border-primary-500/50 bg-transparent text-primary-400 hover:border-primary-400 hover:text-primary-300 hover:bg-primary-500/10 focus:ring-primary-500/50",
      ghost:
        "bg-transparent text-slate-300 hover:bg-dark-600/50 hover:text-primary-400 focus:ring-primary-500/50",
      danger:
        "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 hover:from-red-600 hover:to-red-700 focus:ring-red-500/50",
      success:
        "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-green-700 focus:ring-green-500/50",
      warning:
        "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 focus:ring-amber-500/50",
    };

    // Define size styles with better proportions
    const sizeStyles: Record<ButtonSize, string> = {
      xs: "px-2 py-1 text-xs min-h-[28px]",
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-5 py-2 text-sm min-h-[40px]",
      lg: "px-8 py-3 text-base min-h-[48px]",
      xl: "px-10 py-4 text-lg min-h-[56px]",
    };

    // Define rounded styles
    const roundedStyles: Record<string, string> = {
      default: "rounded-lg",
      full: "rounded-full",
      none: "rounded-none",
    };

    // Combine all styles
    const buttonStyles = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${roundedStyles[rounded]}
    ${fullWidth ? "w-full" : ""}
    ${disabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
    ${className}
  `;

    // Get icon size based on button size
    function getIconSize(size: ButtonSize): number {
      switch (size) {
        case "xs":
          return 14;
        case "sm":
          return 16;
        case "md":
          return 18;
        case "lg":
          return 20;
        case "xl":
          return 24;
        default:
          return 18;
      }
    }

    // Prepare the icons if provided
    const iconSize = getIconSize(size);

    const processedLeadingIcon =
      leadingIcon && isValidElement(leadingIcon)
        ? cloneElement(leadingIcon, {
            // @ts-expect-error - React element props
            size: iconSize,
            className: "flex-shrink-0 mr-2",
            "aria-hidden": true,
          })
        : null;

    const processedTrailingIcon =
      trailingIcon && isValidElement(trailingIcon)
        ? cloneElement(trailingIcon, {
            // @ts-expect-error - React element props
            size: iconSize,
            className: "flex-shrink-0 ml-2",
            "aria-hidden": true,
          })
        : null;

    // Loading spinner component
    function LoadingSpinner(): ReactElement {
      return (
        <svg
          className="mr-2 h-4 w-4 flex-shrink-0 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    // Animation variants
    const buttonVariants = {
      hover: {
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10,
        },
      },
      tap: {
        scale: 0.98,
        transition: { duration: 0.1 },
      },
      initial: {
        scale: 1,
      },
    };

    // Button content
    const buttonContent = (
      <>
        {loading && <LoadingSpinner />}
        {!loading && processedLeadingIcon}
        <span className={loading ? "opacity-0" : ""}>{children}</span>
        {!loading && processedTrailingIcon}
      </>
    );

    // Extra props for external links
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    // Handle keyboard events for links
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (isLink && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const element = event.currentTarget as HTMLAnchorElement;
        element.click();
      }
    };

    // Render with motion effects if animated
    if (animated && !disabled && !loading && !shouldReduceMotion) {
      // Render as link if href is provided
      if (isLink) {
        return (
          <motion.div
            className="inline-block"
            whileHover="hover"
            whileTap="tap"
            initial="initial"
            variants={buttonVariants}
          >
            <Link
              ref={ref as React.Ref<HTMLAnchorElement>}
              href={rest.href as string}
              className={buttonStyles}
              onKeyDown={handleKeyDown}
              data-testid={testId}
              {...externalProps}
              {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
              {buttonContent}
            </Link>
          </motion.div>
        );
      }

      // Otherwise render as button
      return (
        // @ts-ignore
        <motion.button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={buttonStyles}
          disabled={disabled || loading}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
          variants={buttonVariants}
          data-testid={testId}
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {buttonContent}
        </motion.button>
      );
    }

    // Non-animated versions
    if (isLink) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={rest.href as string}
          className={buttonStyles}
          onKeyDown={handleKeyDown}
          data-testid={testId}
          {...externalProps}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {buttonContent}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={buttonStyles}
        disabled={disabled || loading}
        data-testid={testId}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {buttonContent}
      </button>
    );
  },
);

Button.displayName = "Button";
