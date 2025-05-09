import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  rounded?: "default" | "full" | "none";
  animated?: boolean;
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  external = false,
  onClick,
  disabled = false,
  type = "button",
  loading = false,
  rounded = "default",
  animated = true,
}: ButtonProps): React.ReactElement {
  // Define base styles based on variant
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 hover:from-primary-600 hover:to-primary-700",
    secondary:
      "bg-dark-600/50 text-primary-400 border border-dark-500 hover:border-primary-500/50 hover:text-primary-300",
    outline:
      "border border-primary-500/50 bg-transparent text-primary-400 hover:border-primary-400 hover:text-primary-300",
    ghost:
      "bg-transparent text-slate-300 hover:bg-dark-600/30 hover:text-primary-400",
    danger:
      "bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-500/20 hover:from-danger-600 hover:to-danger-700",
    success:
      "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/20 hover:from-success-600 hover:to-success-700",
    warning:
      "bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-lg shadow-warning-500/20 hover:from-warning-600 hover:to-warning-700",
  };

  // Define size styles
  const sizeStyles: Record<ButtonSize, string> = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-8 py-3 text-base",
    xl: "px-10 py-4 text-lg",
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
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${roundedStyles[rounded]}
    ${fullWidth ? "w-full" : ""}
    ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

  // Get icon size based on button size
  const getIconSize = (size: ButtonSize): number => {
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
  };

  // Resize and apply margin to icons
  const iconSize = getIconSize(size);

  const processedLeadingIcon = leadingIcon
    ? React.isValidElement(leadingIcon)
      ? React.cloneElement(leadingIcon as React.ReactElement, {
          // @ts-expect-error: lucide-react types are not accurate
          size: iconSize,
          className: "mr-2",
        })
      : null
    : null;

  const processedTrailingIcon = trailingIcon
    ? React.isValidElement(trailingIcon)
      ? React.cloneElement(trailingIcon as React.ReactElement, {
          // @ts-expect-error: lucide-react types are not accurate
          size: iconSize,
          className: "ml-2",
        })
      : null
    : null;

  // Loading spinner component
  const LoadingSpinner = (): React.ReactElement => (
    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );

  // Animation variants
  const buttonVariants = {
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.97 },
    initial: {
      scale: 1,
    },
  };

  // Button content
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && processedLeadingIcon}
      {children}
      {!loading && processedTrailingIcon}
    </>
  );

  // For external links
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  // Render as motion component if animated
  if (animated && !disabled && !loading) {
    // Render as link if href is provided
    if (href) {
      return (
        <motion.div
          className="inline-block"
          whileHover="hover"
          whileTap="tap"
          initial="initial"
          variants={buttonVariants}
        >
          <Link href={href} className={buttonStyles} {...externalProps}>
            {buttonContent}
          </Link>
        </motion.div>
      );
    }

    // Otherwise render as button
    return (
      <motion.button
        type={type}
        className={buttonStyles}
        onClick={onClick}
        disabled={disabled || loading}
        whileHover="hover"
        whileTap="tap"
        initial="initial"
        variants={buttonVariants}
      >
        {buttonContent}
      </motion.button>
    );
  }

  // Non-animated versions
  if (href) {
    return (
      <Link href={href} className={buttonStyles} {...externalProps}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );
}
