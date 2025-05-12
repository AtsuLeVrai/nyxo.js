import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle,
  Code,
  Info,
  Package2,
  Rocket,
  Shield,
  Sparkles,
  Type,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type React from "react";
import { cloneElement, createElement, isValidElement } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { CodeBlock } from "~/components/ui/CodeBlock";

// Custom components specifically for documentation
function Callout({
  type = "info",
  title,
  children,
  icon,
}: {
  type?: "info" | "warning" | "success";
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const styles = {
    info: {
      container: "bg-primary-500/10 border-primary-500/30",
      icon: <Info className="h-5 w-5 text-primary-400" />,
      title: "text-primary-400",
    },
    warning: {
      container: "bg-warning-500/10 border-warning-500/30",
      icon: <AlertTriangle className="h-5 w-5 text-warning-400" />,
      title: "text-warning-400",
    },
    success: {
      container: "bg-success-500/10 border-success-500/30",
      icon: <CheckCircle className="h-5 w-5 text-success-400" />,
      title: "text-success-400",
    },
  };

  const selectedIcon = icon || styles[type].icon;

  return (
    <div className={`my-6 rounded-lg border p-4 ${styles[type].container}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{selectedIcon}</div>
        <div className="ml-3">
          {title && (
            <h3 className={`font-medium text-sm ${styles[type].title}`}>
              {title}
            </h3>
          )}
          <div className="mt-2 text-slate-300 text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Icon mapping for easy usage in MDX
const IconMap = {
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle,
  Code,
  Sparkles,
  Bot,
  Package2,
  Rocket,
  Shield,
  Type,
};

// Function to render a dynamic icon
const DynamicIcon = ({
  name,
  className = "h-5 w-5",
}: {
  name: keyof typeof IconMap;
  className?: string;
}) => {
  const IconComponent = IconMap[name];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent className={className} />;
};

// Enhanced table component
function Table({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-dark-500 rounded-lg border border-dark-500">
        {children}
      </table>
    </div>
  );
}

function Thead({
  children,
}: {
  children: React.ReactNode;
}) {
  return <thead className="bg-dark-600">{children}</thead>;
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left font-medium text-slate-300 text-xs uppercase tracking-wider"
    >
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap border-dark-500 border-t px-6 py-4 text-slate-300 text-sm">
      {children}
    </td>
  );
}

// Create a TabGroup component for documentation
function TabGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-dark-500 bg-dark-700">
      {children}
    </div>
  );
}

function TabHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex overflow-x-auto border-dark-500 border-b bg-dark-600/50">
      {children}
    </div>
  );
}

function TabItem({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`cursor-pointer px-4 py-2 font-medium text-sm ${
        active
          ? "border-t-2 border-t-primary-500 bg-dark-700 text-primary-400"
          : "text-slate-300 hover:bg-dark-700/30 hover:text-primary-400"
      }`}
    >
      {children}
    </div>
  );
}

function TabContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-4">{children}</div>;
}

// Create a component for API reference
function ApiMethod({
  name,
  type = "method",
  signature,
  returns,
  description,
  example,
  params = [],
}: {
  name: string;
  type?: "method" | "property";
  signature?: string;
  returns?: string;
  description: string;
  example?: string;
  params?: { name: string; type: string; description: string }[];
}) {
  return (
    <div className="my-8 overflow-hidden rounded-lg border border-dark-500">
      <div className="border-dark-500 border-b bg-dark-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-primary-400">
            {name}
            <span className="ml-2 text-slate-400 text-sm">
              {signature && `(${signature})`}
            </span>
          </h3>
          <Badge variant={type === "method" ? "primary" : "success"}>
            {type}
          </Badge>
        </div>
        {returns && (
          <div className="mt-2 text-slate-300 text-sm">
            <span className="text-slate-400">Returns:</span> {returns}
          </div>
        )}
      </div>
      <div className="bg-dark-700 p-6">
        <div className="mb-4 text-slate-300">{description}</div>

        {params.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 font-medium text-slate-200 text-sm">
              Parameters
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-500">
                <thead className="bg-dark-600/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-300 text-xs">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-300 text-xs">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-300 text-xs">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {params.map((param, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <tr key={i}>
                      <td className="px-4 py-2 text-primary-400 text-sm">
                        {param.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-success-400">
                        {param.type}
                      </td>
                      <td className="px-4 py-2 text-slate-300 text-sm">
                        {param.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {example && (
          <div>
            <h4 className="mb-2 font-medium text-slate-200 text-sm">Example</h4>
            <CodeBlock
              code={example}
              language="typescript"
              showLineNumbers={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Create standalone components for Card's children
function CardBody({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

function CardTitle({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`font-medium text-lg text-white ${className}`}>
      {children}
    </h3>
  );
}

function CardDescription({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <p className={`text-slate-400 ${className}`}>{children}</p>;
}

// Define components to be used in MDX files
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Default HTML overrides
    h1: ({ children }) => (
      <h1 className="mt-8 mb-4 font-bold text-3xl text-white tracking-tight sm:text-4xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-4 border-dark-500 border-b pb-2 font-bold text-2xl text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-3 font-semibold text-white text-xl">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-3 font-semibold text-lg text-primary-400">
        {children}
      </h4>
    ),
    p: ({ children }) => <p className="my-4 text-slate-300">{children}</p>,
    a: ({ href, children }) => (
      <Link
        href={href}
        className="text-primary-400 underline underline-offset-2 hover:text-primary-300"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="my-4 list-disc pl-6 text-slate-300">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 list-decimal pl-6 text-slate-300">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-4 rounded-r-lg border-primary-500 border-l-4 bg-dark-600/30 py-1 pl-4 text-slate-300 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-dark-500" />,

    // Code blocks
    pre: ({ children }) => <div className="my-6">{children}</div>,
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");

      if (!match) {
        return (
          <code
            className="rounded bg-dark-600 px-1.5 py-0.5 font-mono text-slate-200 text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <CodeBlock
          code={String(children).trim()}
          language={match[1] as any}
          showLineNumbers={true}
          {...props}
        />
      );
    },

    // Table elements
    table: Table,
    thead: Thead,
    th: Th,
    td: Td,

    // Custom components
    Button: ({ children, variant, size, href, icon }) => {
      let leadingIcon = null;
      if (
        icon &&
        typeof icon === "string" &&
        IconMap[icon as keyof typeof IconMap]
      ) {
        leadingIcon = createElement(IconMap[icon as keyof typeof IconMap], {
          className: "h-5 w-5",
        });
      } else if (isValidElement(icon)) {
        leadingIcon = icon;
      }

      return (
        <Button
          variant={variant}
          size={size}
          href={href}
          leadingIcon={leadingIcon as React.ReactElement}
        >
          {children}
        </Button>
      );
    },
    Badge: ({ children, variant, icon }) => {
      let iconElement = null;
      if (
        icon &&
        typeof icon === "string" &&
        IconMap[icon as keyof typeof IconMap]
      ) {
        iconElement = createElement(IconMap[icon as keyof typeof IconMap], {
          className: "h-4 w-4",
        });
      } else if (isValidElement(icon)) {
        iconElement = icon;
      }

      return (
        <Badge variant={variant} icon={iconElement as React.ReactElement}>
          {children}
        </Badge>
      );
    },
    Card: ({ children, variant, ...props }) => (
      <Card variant={variant} {...props}>
        {children}
      </Card>
    ),
    // Standalone components instead of dotted notation
    CardBody,
    CardTitle,
    CardDescription,
    FadeIn: ({ children, ...props }) => <FadeIn {...props}>{children}</FadeIn>,
    Callout,
    Icon: DynamicIcon,

    // Tabs
    TabGroup,
    TabHeading,
    TabItem,
    TabContent,

    // API Reference
    ApiMethod,

    ...components,
  };
}
