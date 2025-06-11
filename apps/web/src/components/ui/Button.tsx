import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

/**
 * Available button visual variants
 */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning";

/**
 * Available button sizes
 */
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Props for the Button component
 */
interface ButtonProps {
  /** Content to be displayed inside the button */
  children: ReactNode;
  /** Visual style variant of the button */
  variant?: ButtonVariant;
  /** Size of the button affecting padding and font size */
  size?: ButtonSize;
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;

  // Icon configuration
  /** Icon to display before the button text */
  leadingIcon?: ReactElement;
  /** Icon to display after the button text */
  trailingIcon?: ReactElement;

  // Button-specific props
  /** Click handler for button behavior */
  onClick?: () => void;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";

  // Link-specific props
  /** URL to navigate to (converts button to link) */
  href?: string;
  /** Whether the link should open in a new tab */
  external?: boolean;
}

/**
 * Button variant styling configurations
 * Each variant provides distinct visual appearance and interaction states
 */
const VARIANTS = {
  /** Primary action button with gradient background */
  primary:
    "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500/50",
  /** Secondary button with subtle background and border */
  secondary:
    "bg-dark-600/50 text-primary-400 border border-dark-500 hover:bg-dark-500/50 focus:ring-primary-500/50",
  /** Outlined button with transparent background */
  outline:
    "border border-primary-500/50 bg-transparent text-primary-400 hover:bg-primary-500/10 focus:ring-primary-500/50",
  /** Minimal button with no background or border */
  ghost:
    "bg-transparent text-slate-300 hover:bg-dark-600/50 hover:text-primary-400 focus:ring-primary-500/50",
  /** Destructive action button in red */
  danger:
    "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500/50",
  /** Success/confirmation button in green */
  success:
    "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500/50",
  /** Warning/caution button in amber */
  warning:
    "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 focus:ring-amber-500/50",
};

/**
 * Button size configurations
 * Defines padding, text size, and minimum height for each size variant
 */
const SIZES = {
  /** Extra small button for compact interfaces */
  xs: "px-2 py-1 text-xs min-h-[28px]",
  /** Small button for secondary actions */
  sm: "px-3 py-1.5 text-sm min-h-[32px]",
  /** Medium button - default size for most use cases */
  md: "px-5 py-2 text-sm min-h-[40px]",
  /** Large button for primary actions */
  lg: "px-8 py-3 text-base min-h-[48px]",
  /** Extra large button for hero sections */
  xl: "px-10 py-4 text-lg min-h-[56px]",
};

/**
 * Icon size configurations corresponding to button sizes
 */
const ICON_SIZES = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

/**
 * A versatile button component that can function as both button and link
 *
 * Features:
 * - Multiple visual variants for different use cases
 * - Configurable sizes from extra small to extra large
 * - Support for leading and trailing icons
 * - Automatic conversion to Next.js Link when href is provided
 * - Consistent focus and hover states
 * - Accessibility-friendly disabled states
 *
 * @param props - Component props
 * @returns Interactive button or link element with consistent styling
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  onClick,
  type = "button",
  href,
  external = false,
}: ButtonProps) {
  // Consolidated base styling with variant, size, and state classes
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800
    ${VARIANTS[variant]} ${SIZES[size]}
    ${fullWidth ? "w-full" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
    ${className}
  `;

  /**
   * Renders an icon with appropriate sizing and spacing
   * @param icon - The icon element to render
   * @param position - Whether the icon is leading or trailing
   * @returns Wrapped icon element with proper styling
   */
  const renderIcon = (
    icon: ReactElement | undefined,
    position: "leading" | "trailing",
  ) => {
    if (!icon) {
      return null;
    }

    const iconClasses = `${ICON_SIZES[size]} ${position === "leading" ? "mr-2" : "ml-2"} flex-shrink-0`;

    // Wrap icon in span with appropriate classes for consistent spacing
    return <span className={iconClasses}>{icon}</span>;
  };

  // Button content with optional icons
  const content = (
    <>
      {renderIcon(leadingIcon, "leading")}
      <span>{children}</span>
      {renderIcon(trailingIcon, "trailing")}
    </>
  );

  // Render as Next.js Link when href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={baseStyles}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  // Render as standard HTML button
  return (
    <button
      type={type}
      className={baseStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
