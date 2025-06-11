/**
 * Props for the Card component
 */
interface CardProps {
  /** Content to be rendered inside the card */
  children: React.ReactNode;
  /** Additional CSS classes to apply */
  className?: string;
  /** Visual variant of the card affecting styling and behavior */
  variant?: "default" | "feature";
}

/**
 * A versatile card component with customizable variants and styling
 *
 * The Card component provides a container with consistent border, background,
 * and transition effects. It supports different variants for various use cases
 * and includes subcomponents for structured content layout.
 *
 * @param props - Component props
 * @returns Styled card container with optional hover effects
 */
export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  // Variant-specific styling configurations
  const variants = {
    /** Standard card appearance without special interactions */
    default: "border border-dark-500 bg-dark-600/80",
    /** Interactive card with hover effects for featured content */
    feature: "border border-dark-500 bg-dark-600/80 hover:border-dark-400",
  };

  return (
    <div
      className={`overflow-hidden rounded-lg backdrop-blur-sm transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Props for Card subcomponents
 */
interface CardSubcomponentProps {
  /** Content to be rendered inside the subcomponent */
  children: React.ReactNode;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * Card header section with consistent padding
 * Ideal for titles, actions, or primary card content
 */
Card.Header = ({ children, className = "" }: CardSubcomponentProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

/**
 * Card body section with reduced padding
 * Suitable for main content areas and descriptions
 */
Card.Body = ({ children, className = "" }: CardSubcomponentProps) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

/**
 * Card title component with semantic heading styling
 * Provides consistent typography for card titles
 */
Card.Title = ({ children, className = "" }: CardSubcomponentProps) => (
  <h3 className={`font-semibold text-lg text-white ${className}`}>
    {children}
  </h3>
);

/**
 * Card description component for secondary text
 * Uses muted text color for supplementary information
 */
Card.Description = ({ children, className = "" }: CardSubcomponentProps) => (
  <p className={`text-slate-400 ${className}`}>{children}</p>
);
