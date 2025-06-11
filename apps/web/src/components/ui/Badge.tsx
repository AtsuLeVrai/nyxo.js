/**
 * Props for the Badge component
 */
interface BadgeProps {
  /** Content to be displayed inside the badge */
  children: React.ReactNode;
  /** Color variant of the badge affecting background and text colors */
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  /** Size of the badge affecting padding and font size */
  size?: "xs" | "sm" | "md";
  /** Optional icon to display before the badge text */
  icon?: React.ReactElement;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * A compact badge component for displaying status, categories, or labels
 *
 * The Badge component provides a visually distinct way to highlight small pieces
 * of information. It supports different color variants for semantic meaning
 * (success, warning, danger, etc.) and multiple sizes for various contexts.
 *
 * Features:
 * - Color-coded variants for semantic meaning
 * - Multiple sizes for different use cases
 * - Optional icon support with automatic sizing
 * - Rounded design with subtle borders and backgrounds
 * - Consistent typography and spacing
 *
 * @param props - Component props
 * @returns Styled badge element with optional icon
 */
export function Badge({
  children,
  variant = "primary",
  size = "sm",
  icon,
  className = "",
}: BadgeProps) {
  /**
   * Color variant configurations
   * Each variant uses a semi-transparent background with matching text and border colors
   */
  const variants = {
    /** Primary brand color for general use */
    primary: "bg-primary-500/15 text-primary-300 border-primary-500/30",
    /** Green variant for positive states and success messages */
    success: "bg-green-500/15 text-green-300 border-green-500/30",
    /** Amber variant for warnings and cautionary information */
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    /** Red variant for errors and critical states */
    danger: "bg-red-500/15 text-red-300 border-red-500/30",
    /** Cyan variant for informational content */
    info: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  };

  /**
   * Size configurations
   * Defines padding and font size for each size variant
   */
  const sizes = {
    /** Extra small badge for minimal space usage */
    xs: "px-1.5 py-0.5 text-xs",
    /** Small badge - default size for most use cases */
    sm: "px-2 py-1 text-xs",
    /** Medium badge for more prominent display */
    md: "px-3 py-1.5 text-sm",
  };

  /**
   * Icon size configurations corresponding to badge sizes
   */
  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {/* Render icon with appropriate spacing if provided */}
      {icon && <span className={`mr-1.5 ${iconSizes[size]}`}>{icon}</span>}
      {children}
    </span>
  );
}
