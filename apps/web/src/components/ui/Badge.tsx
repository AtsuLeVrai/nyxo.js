import React from "react";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";
export type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  size = "sm",
  icon,
  className = "",
}: BadgeProps) {
  // Define variant styles
  const variantStyles = {
    primary: "border-primary-500/20 bg-primary-500/10 text-primary-400",
    success: "border-success-500/20 bg-success-500/10 text-success-400",
    warning: "border-warning-500/20 bg-warning-500/10 text-warning-400",
    danger: "border-danger-500/20 bg-danger-500/10 text-danger-400",
    neutral: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  };

  // Define size styles
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  // Get icon size based on badge size
  const getIconSize = (size: BadgeSize) => {
    return size === "sm" ? 14 : 16;
  };

  // Clone icon with size if provided
  const iconElement = icon
    ? React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement, {
          // @ts-expect-error: lucide-react types are not accurate
          size: getIconSize(size),
          className: "mr-1",
        })
      : null
    : null;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {iconElement}
      {children}
    </span>
  );
}
