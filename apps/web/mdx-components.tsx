import * as LucideIcons from "lucide-react";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Info,
  Lightbulb,
  Link2,
  XCircle,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import {
  TabContent,
  TabGroup,
  TabHeading,
  TabItem,
} from "~/components/mdx/Tabs";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { CodeBlock } from "~/components/ui/CodeBlock";

/**
 * Props for heading components with anchor link functionality
 */
interface HeadingProps {
  /** The heading content */
  children: ReactNode;
  /** Unique identifier for the heading anchor */
  id?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generates a URL-friendly slug from heading text
 * @param text - The text content to convert to a slug
 * @returns URL-safe string suitable for use as an anchor ID
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

/**
 * Extracts text content from React children for slug generation
 * @param children - React children to extract text from
 * @returns Plain text string extracted from children
 */
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return children.toString();
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  return "";
}

/**
 * Creates a heading component with anchor link functionality
 * @param level - The heading level (1-6)
 * @param baseClasses - Base CSS classes for the heading
 * @returns Heading component with anchor link support
 */
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, baseClasses: string) {
  return function Heading({
    children,
    id,
    className = "",
    ...props
  }: HeadingProps) {
    const HeadingTag = `h${level}` as const;
    const textContent = extractTextFromChildren(children);
    const headingId = id || generateSlug(textContent);

    return (
      <HeadingTag
        id={headingId}
        className={`group relative scroll-mt-20 ${baseClasses} ${className}`}
        {...props}
      >
        {children}
        {/* Anchor link icon that appears on hover */}
        <a
          href={`#${headingId}`}
          className="hover:!opacity-100 ml-2 inline-flex items-center opacity-0 transition-opacity group-hover:opacity-60"
          aria-label={`Link to ${textContent}`}
          tabIndex={-1}
        >
          <Link2 className="h-4 w-4 text-slate-400" />
        </a>
      </HeadingTag>
    );
  };
}

/**
 * Custom link component that handles internal and external links
 */
function CustomLink({ href, children, ...props }: ComponentProps<"a">) {
  // Handle external links
  if (href?.startsWith("http")) {
    return (
      <a
        href={href}
        className="inline-flex items-center text-primary-400 underline decoration-primary-400/30 underline-offset-2 transition-colors hover:text-primary-300 hover:decoration-primary-300/50"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        <ExternalLink className="ml-1 h-3 w-3" />
      </a>
    );
  }

  // Handle internal links
  if (href) {
    return (
      <Link
        href={href}
        className="text-primary-400 underline decoration-primary-400/30 underline-offset-2 transition-colors hover:text-primary-300 hover:decoration-primary-300/50"
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Fallback for links without href
  return (
    <span className="text-primary-400" {...props}>
      {children}
    </span>
  );
}

/**
 * Custom code component that renders inline code or code blocks
 */
function CustomCode({ children, className, ...props }: ComponentProps<"code">) {
  const isBlock = className?.includes("language-");

  if (isBlock) {
    // Extract language from className (e.g., "language-typescript" -> "typescript")
    const language = className?.replace("language-", "") as any;
    const code = Array.isArray(children)
      ? children.join("")
      : String(children || "");

    return <CodeBlock code={code} language={language} className="my-6" />;
  }

  // Inline code
  return (
    <code
      className="rounded bg-dark-600/60 px-1.5 py-0.5 font-mono text-primary-300 text-sm"
      {...props}
    >
      {children}
    </code>
  );
}

/**
 * Custom pre component that wraps code blocks
 * Note: This is typically not used directly as CodeBlock handles pre formatting
 */
function CustomPre({ children, ...props }: ComponentProps<"pre">) {
  return <div className="my-6">{children}</div>;
}

/**
 * Custom blockquote component for highlighted content
 */
function CustomBlockquote({
  children,
  ...props
}: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className="my-6 rounded-r-lg border-primary-500/50 border-l-4 bg-dark-600/30 py-4 pr-4 pl-6"
      {...props}
    >
      <div className="text-slate-300 italic">{children}</div>
    </blockquote>
  );
}

/**
 * Custom table component with styling consistent with the site design
 */
function CustomTable({ children, ...props }: ComponentProps<"table">) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-dark-500">
      <table className="w-full border-collapse bg-dark-700/50" {...props}>
        {children}
      </table>
    </div>
  );
}

/**
 * Custom table header component
 */
function CustomThead({ children, ...props }: ComponentProps<"thead">) {
  return (
    <thead className="bg-dark-600/50" {...props}>
      {children}
    </thead>
  );
}

/**
 * Custom table header cell component
 */
function CustomTh({ children, ...props }: ComponentProps<"th">) {
  return (
    <th
      className="border-dark-500 border-b px-4 py-3 text-left font-semibold text-slate-200 text-sm"
      {...props}
    >
      {children}
    </th>
  );
}

/**
 * Custom table cell component
 */
function CustomTd({ children, ...props }: ComponentProps<"td">) {
  return (
    <td
      className="border-dark-500/50 border-b px-4 py-3 text-slate-300 text-sm"
      {...props}
    >
      {children}
    </td>
  );
}

/**
 * Custom image component with responsive styling
 */
function CustomImage({ src, alt, ...props }: ComponentProps<"img">) {
  return (
    <div className="my-6">
      <img
        src={src}
        alt={alt}
        className="h-auto max-w-full rounded-lg border border-dark-500"
        {...props}
      />
      {alt && (
        <p className="mt-2 text-center text-slate-400 text-sm italic">{alt}</p>
      )}
    </div>
  );
}

/**
 * Custom horizontal rule component
 */
function CustomHr(props: ComponentProps<"hr">) {
  return (
    <hr
      className="my-8 h-px border-0 bg-gradient-to-r from-transparent via-dark-500 to-transparent"
      {...props}
    />
  );
}

/**
 * Custom unordered list component
 */
function CustomUl({ children, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className="my-4 ml-6 list-disc space-y-2 marker:text-primary-400"
      {...props}
    >
      {children}
    </ul>
  );
}

/**
 * Custom ordered list component
 */
function CustomOl({ children, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className="my-4 ml-6 list-decimal space-y-2 marker:text-primary-400"
      {...props}
    >
      {children}
    </ol>
  );
}

/**
 * Custom list item component
 */
function CustomLi({ children, ...props }: ComponentProps<"li">) {
  return (
    <li className="text-slate-300 leading-relaxed" {...props}>
      {children}
    </li>
  );
}

/**
 * Custom paragraph component
 */
function CustomP({ children, ...props }: ComponentProps<"p">) {
  return (
    <p className="my-4 text-slate-300 leading-relaxed" {...props}>
      {children}
    </p>
  );
}

/**
 * Custom strong/bold text component
 */
function CustomStrong({ children, ...props }: ComponentProps<"strong">) {
  return (
    <strong className="font-semibold text-slate-200" {...props}>
      {children}
    </strong>
  );
}

/**
 * Custom emphasis/italic text component
 */
function CustomEm({ children, ...props }: ComponentProps<"em">) {
  return (
    <em className="text-slate-300 italic" {...props}>
      {children}
    </em>
  );
}

/**
 * Props for the Callout component
 */
interface CalloutProps {
  /** Content to be displayed inside the callout */
  children: ReactNode;
  /** Type of callout affecting styling and icon */
  type?: "info" | "warning" | "error" | "success" | "note";
  /** Optional title for the callout */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Callout component for highlighting important information in documentation
 *
 * This component creates visually distinct blocks for different types of information
 * such as notes, warnings, errors, and success messages. Each type has its own
 * color scheme and icon to provide immediate visual context.
 *
 * @param props - Component props
 * @returns Styled callout block with icon and content
 */
function Callout({
  children,
  type = "info",
  title,
  className = "",
}: CalloutProps) {
  const variants = {
    info: {
      container: "border-blue-500/30 bg-blue-500/10",
      icon: <Info className="h-5 w-5 text-blue-400" />,
      title: "text-blue-300",
      defaultTitle: "Info",
    },
    warning: {
      container: "border-amber-500/30 bg-amber-500/10",
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      title: "text-amber-300",
      defaultTitle: "Warning",
    },
    error: {
      container: "border-red-500/30 bg-red-500/10",
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: "text-red-300",
      defaultTitle: "Error",
    },
    success: {
      container: "border-green-500/30 bg-green-500/10",
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      title: "text-green-300",
      defaultTitle: "Success",
    },
    note: {
      container: "border-primary-500/30 bg-primary-500/10",
      icon: <Lightbulb className="h-5 w-5 text-primary-400" />,
      title: "text-primary-300",
      defaultTitle: "Note",
    },
  };

  const variant = variants[type];
  const displayTitle = title || variant.defaultTitle;

  return (
    <div
      className={`my-6 rounded-lg border p-4 ${variant.container} ${className}`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">{variant.icon}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h5 className={`mb-2 font-semibold text-sm ${variant.title}`}>
            {displayTitle}
          </h5>

          {/* Content */}
          <div className="text-slate-300 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Props for the Icon component
 */
interface IconProps {
  /** Name of the Lucide React icon to display */
  name: keyof typeof LucideIcons;
  /** Size of the icon */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Color of the icon */
  color?: string;
}

/**
 * Generic Icon component that can display any Lucide React icon by name
 *
 * This component provides a convenient way to use any Lucide React icon in MDX
 * files by specifying the icon name as a string. It supports customization
 * of size, color, and additional styling.
 *
 * @param props - Component props
 * @returns Lucide React icon component
 */
function Icon({ name, size = 20, className = "", color, ...props }: IconProps) {
  // Get the icon component from Lucide React
  const IconComponent = LucideIcons[name] as React.ComponentType<any>;

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent size={size} className={className} color={color} {...props} />
  );
}

/**
 * MDX components mapping for Next.js
 *
 * This configuration provides custom components for all standard Markdown elements,
 * ensuring they integrate seamlessly with the Nyxo.js design system. Each component
 * is styled to match the dark theme with primary accent colors.
 *
 * Features:
 * - Automatic anchor links for all headings
 * - Syntax-highlighted code blocks using existing CodeBlock component
 * - Styled tables, lists, and blockquotes
 * - External link indicators
 * - Responsive images with captions
 * - Consistent typography and spacing
 *
 * @returns MDX components configuration object
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Heading components with anchor links
    h1: createHeading(
      1,
      "mt-8 mb-4 font-extrabold text-3xl text-slate-50 tracking-tight sm:text-4xl",
    ),
    h2: createHeading(
      2,
      "mt-12 mb-4 font-bold text-2xl text-slate-50 tracking-tight sm:text-3xl",
    ),
    h3: createHeading(
      3,
      "mt-8 mb-3 font-semibold text-xl text-slate-50 tracking-tight sm:text-2xl",
    ),
    h4: createHeading(
      4,
      "mt-6 mb-2 font-semibold text-lg text-slate-50 tracking-tight",
    ),
    h5: createHeading(
      5,
      "mt-4 mb-2 font-medium text-base text-slate-50 tracking-tight",
    ),
    h6: createHeading(
      6,
      "mt-4 mb-2 font-medium text-sm text-slate-50 tracking-tight uppercase",
    ),

    // Text and inline elements
    p: CustomP,
    a: CustomLink,
    strong: CustomStrong,
    em: CustomEm,

    // Code elements
    code: CustomCode,
    pre: CustomPre,

    // Lists
    ul: CustomUl,
    ol: CustomOl,
    li: CustomLi,

    // Block elements
    blockquote: CustomBlockquote,
    hr: CustomHr,

    // Table elements
    table: CustomTable,
    thead: CustomThead,
    tbody: (props) => <tbody {...props} />,
    tr: (props) => <tr {...props} />,
    th: CustomTh,
    td: CustomTd,

    // Media elements
    img: CustomImage,

    // Custom components that can be used in MDX
    Badge,
    Button,
    Card,
    CardBody: Card.Body,
    CardHeader: Card.Header,
    CardTitle: Card.Title,
    CardDescription: Card.Description,
    CodeBlock,
    Callout,
    FadeIn,
    Icon,
    TabGroup,
    TabHeading,
    TabItem,
    TabContent,

    // Override any components passed in
    ...components,
  };
}
