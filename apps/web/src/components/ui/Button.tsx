import Link from "next/link";
import type React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
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
}

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
}: ButtonProps) {
  // Define base styles based on variant
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 hover:from-primary-600 hover:to-primary-700",
    secondary:
      "bg-dark-600/50 text-primary-400 border border-dark-500 hover:border-primary-500/50 hover:text-primary-300",
    outline:
      "border border-primary-500/50 bg-transparent text-primary-400 hover:border-primary-400 hover:text-primary-300",
    ghost:
      "bg-transparent text-slate-300 hover:bg-dark-600/30 hover:text-primary-400",
  };

  // Define size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-8 py-3 text-base",
  };

  // Combine all styles
  const buttonStyles = `
    inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? "w-full" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

  // For external links
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  // Render as link if href is provided
  if (href) {
    return (
      <Link href={href} className={buttonStyles} {...externalProps}>
        {leadingIcon && <span className="mr-2">{leadingIcon}</span>}
        {children}
        {trailingIcon && <span className="ml-2">{trailingIcon}</span>}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {leadingIcon && <span className="mr-2">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="ml-2">{trailingIcon}</span>}
    </button>
  );
}
