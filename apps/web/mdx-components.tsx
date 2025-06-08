import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle,
  Code,
  Github,
  Info,
  MessageSquare,
  Package2,
  Rocket,
  Shield,
  Sparkles,
  Type,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type React from "react";
import { createElement, isValidElement, useMemo } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { CodeBlock } from "~/components/ui/CodeBlock";

const ICON_MAP = {
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
  Github,
  MessageSquare,
} as const;

type IconName = keyof typeof ICON_MAP;

interface CalloutProps {
  type?: "info" | "warning" | "success" | "danger";
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function Callout({ type = "info", title, children, icon }: CalloutProps) {
  const styles = useMemo(
    () => ({
      info: {
        container: "bg-primary-500/10 border-primary-500/30",
        icon: <Info className="h-5 w-5 text-primary-400" />,
        title: "text-primary-400",
      },
      warning: {
        container: "bg-amber-500/10 border-amber-500/30",
        icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
        title: "text-amber-400",
      },
      success: {
        container: "bg-green-500/10 border-green-500/30",
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
        title: "text-green-400",
      },
      danger: {
        container: "bg-red-500/10 border-red-500/30",
        icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
        title: "text-red-400",
      },
    }),
    [],
  );

  const selectedIcon = icon || styles[type].icon;

  return (
    <div className={`my-6 rounded-xl border p-4 ${styles[type].container}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{selectedIcon}</div>
        <div className="ml-3">
          {title && (
            <h3 className={`font-medium text-sm ${styles[type].title}`}>
              {title}
            </h3>
          )}
          <div className="mt-2 text-slate-300 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DynamicIconProps {
  name: IconName;
  className?: string;
}

function DynamicIcon({ name, className = "h-5 w-5" }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }
  return <IconComponent className={className} />;
}

interface TableProps {
  children: React.ReactNode;
}

function Table({ children }: TableProps) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-dark-500 rounded-lg border border-dark-500 bg-dark-700/50">
        {children}
      </table>
    </div>
  );
}

function Thead({ children }: TableProps) {
  return <thead className="bg-dark-600/50">{children}</thead>;
}

function Th({ children }: TableProps) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left font-medium text-slate-300 text-xs uppercase tracking-wider"
    >
      {children}
    </th>
  );
}

function Td({ children }: TableProps) {
  return (
    <td className="whitespace-nowrap border-dark-500 border-t px-6 py-4 text-slate-300 text-sm">
      {children}
    </td>
  );
}

function TabGroup({ children }: TableProps) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-dark-500 bg-dark-700/50 backdrop-blur-sm">
      {children}
    </div>
  );
}

function TabHeading({ children }: TableProps) {
  return (
    <div className="flex overflow-x-auto border-dark-500 border-b bg-dark-600/50">
      {children}
    </div>
  );
}

interface TabItemProps {
  children: React.ReactNode;
  active?: boolean;
}

function TabItem({ children, active }: TabItemProps) {
  return (
    <div
      className={`cursor-pointer px-4 py-3 font-medium text-sm transition-all ${
        active
          ? "border-t-2 border-t-primary-500 bg-dark-700/70 text-primary-400"
          : "text-slate-300 hover:bg-dark-700/30 hover:text-primary-400"
      }`}
    >
      {children}
    </div>
  );
}

function TabContent({ children }: TableProps) {
  return <div className="p-4">{children}</div>;
}

interface ApiMethodProps {
  name: string;
  type?: "method" | "property" | "interface" | "type";
  signature?: string;
  returns?: string;
  description: string;
  example?: string;
  params?: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }>;
}

function ApiMethod({
  name,
  type = "method",
  signature,
  returns,
  description,
  example,
  params = [],
}: ApiMethodProps) {
  const typeVariants = {
    method: { color: "primary", label: "Method" },
    property: { color: "success", label: "Property" },
    interface: { color: "info", label: "Interface" },
    type: { color: "warning", label: "Type" },
  } as const;

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-dark-500 bg-dark-700/30">
      <div className="border-dark-500 border-b bg-dark-600/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-primary-400">
            <code className="rounded bg-dark-700 px-2 py-1 text-primary-300">
              {name}
            </code>
            {signature && (
              <span className="ml-2 font-normal text-slate-400 text-sm">
                ({signature})
              </span>
            )}
          </h3>
          <Badge variant={typeVariants[type].color as any}>
            {typeVariants[type].label}
          </Badge>
        </div>
        {returns && (
          <div className="mt-3 text-slate-300 text-sm">
            <span className="text-slate-400">Returns:</span>{" "}
            <code className="rounded bg-dark-700 px-1.5 py-0.5 text-green-400">
              {returns}
            </code>
          </div>
        )}
      </div>

      <div className="bg-dark-700/20 p-6">
        <div className="mb-4 text-slate-300 leading-relaxed">{description}</div>

        {params.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-slate-200">Parameters</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-500 rounded-lg border border-dark-500">
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
                    <tr key={`${param.name}-${i}`}>
                      <td className="px-4 py-2 text-primary-400 text-sm">
                        <code className="rounded bg-dark-700 px-1.5 py-0.5">
                          {param.name}
                          {param.optional && (
                            <span className="text-slate-500">?</span>
                          )}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <code className="rounded bg-dark-700 px-1.5 py-0.5 text-green-400">
                          {param.type}
                        </code>
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
            <h4 className="mb-3 font-medium text-slate-200">Example</h4>
            <CodeBlock
              code={example}
              language="typescript"
              showLineNumbers={true}
              className="text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface CardComponentProps {
  children: React.ReactNode;
  className?: string;
}

function CardBody({ children, className = "" }: CardComponentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }: CardComponentProps) {
  return (
    <h3
      className={`font-semibold text-lg text-white leading-tight ${className}`}
    >
      {children}
    </h3>
  );
}

function CardDescription({ children, className = "" }: CardComponentProps) {
  return (
    <p className={`text-slate-400 leading-relaxed ${className}`}>{children}</p>
  );
}

interface CustomButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: string | React.ReactElement;
  external?: boolean;
  className?: string;
}

function CustomButton({
  children,
  variant,
  size,
  href,
  icon,
  external,
  className,
}: CustomButtonProps) {
  let leadingIcon = null;

  if (typeof icon === "string" && ICON_MAP[icon as IconName]) {
    leadingIcon = createElement(ICON_MAP[icon as IconName], {
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
      external={external}
      className={className}
    >
      {children}
    </Button>
  );
}

interface CustomBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "info";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: string | React.ReactElement;
  animated?: boolean;
  className?: string;
}

function CustomBadge({
  children,
  variant,
  size,
  icon,
  animated,
  className,
}: CustomBadgeProps) {
  let iconElement = null;

  if (typeof icon === "string" && ICON_MAP[icon as IconName]) {
    iconElement = createElement(ICON_MAP[icon as IconName], {
      className: "h-4 w-4",
    });
  } else if (isValidElement(icon)) {
    iconElement = icon;
  }

  return (
    <Badge
      variant={variant}
      size={size}
      icon={iconElement as React.ReactElement}
      animated={animated}
      className={className}
    >
      {children}
    </Badge>
  );
}

interface CodeComponentProps {
  className?: string;
  children: React.ReactNode;
}

function CodeComponent({ className, children, ...props }: CodeComponentProps) {
  const match = /language-(\w+)/.exec(className || "");

  if (!match) {
    return (
      <code
        className="rounded-md border border-dark-500/30 bg-dark-600/80 px-1.5 py-0.5 font-mono text-slate-200 text-sm"
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
      className="my-4"
      {...props}
    />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-8 mb-6 font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-4 border-dark-500/50 border-b pb-3 font-bold text-2xl text-white">
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
    h5: ({ children }) => (
      <h5 className="mt-4 mb-2 font-medium text-base text-slate-200">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mt-4 mb-2 font-medium text-slate-300 text-sm">
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="my-4 text-slate-300 leading-relaxed">{children}</p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href || "#"}
        className="text-primary-400 underline underline-offset-2 transition-colors hover:text-primary-300 focus:text-primary-300"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="my-4 list-disc space-y-1 pl-6 text-slate-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 list-decimal space-y-1 pl-6 text-slate-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-r-xl border-primary-500 border-l-4 bg-dark-600/30 py-3 pl-6 text-slate-300 italic backdrop-blur-sm">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-dark-500/50" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
    pre: ({ children }) => <div className="my-6">{children}</div>,
    code: CodeComponent,
    table: Table,
    thead: Thead,
    th: Th,
    td: Td,
    Button: CustomButton,
    Badge: CustomBadge,
    Card: ({ children, variant, ...props }) => (
      <Card variant={variant} {...props}>
        {children}
      </Card>
    ),
    CardBody,
    CardTitle,
    CardDescription,
    FadeIn: ({ children, ...props }) => <FadeIn {...props}>{children}</FadeIn>,
    Callout,
    Icon: DynamicIcon,
    TabGroup,
    TabHeading,
    TabItem,
    TabContent,
    ApiMethod,
    ...components,
  };
}
