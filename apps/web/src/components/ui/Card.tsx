import { motion } from "framer-motion";
import type React from "react";

export type CardVariant =
  | "default"
  | "elevated"
  | "feature"
  | "testimonial"
  | "pricing";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  isHighlighted?: boolean;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  isHighlighted = false,
  animate = true,
  className = "",
  onClick,
}: CardProps) {
  // Base styles for all cards
  const baseStyles = "rounded-lg overflow-hidden";

  // Specific styles for each variant
  const variantStyles = {
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

  // Handle gradient border for highlighted items
  const renderCardWithGradient = () => {
    if (isHighlighted) {
      return (
        <div className="group relative">
          <div className="-inset-0.5 absolute rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 opacity-75 blur-sm" />
          <div className={combinedStyles}>{children}</div>
        </div>
      );
    }

    return <div className={combinedStyles}>{children}</div>;
  };

  // Return with or without animation
  if (animate) {
    return (
      <motion.div className="relative" {...animationProps} onClick={onClick}>
        {renderCardWithGradient()}
      </motion.div>
    );
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div className="relative" onClick={onClick}>
      {renderCardWithGradient()}
    </div>
  );
}

// Subcomponents for organization
Card.Header = function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

Card.Body = function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`bg-dark-700/50 p-6 ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`font-medium text-lg text-white ${className}`}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-slate-400 ${className}`}>{children}</p>;
};
