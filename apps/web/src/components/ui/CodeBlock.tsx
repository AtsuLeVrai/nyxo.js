"use client";

import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import {
  Check,
  ClipboardCopy,
  Code as CodeIcon,
  Download,
  Terminal,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { JetBrains_Mono } from "next/font/google";
// Import syntax highlighter
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export type ProgrammingLanguage =
  | "typescript"
  | "javascript"
  | "jsx"
  | "tsx"
  | "json"
  | "bash"
  | "markdown"
  | "css"
  | "html"
  | "scss"
  | "python"
  | "java"
  | "csharp"
  | "go"
  | "rust"
  | "cpp"
  | "text";

interface CodeTabData {
  title: string;
  language: ProgrammingLanguage;
  code: string;
}

export interface CodeBlockProps {
  code: string;
  language?: ProgrammingLanguage;
  showLineNumbers?: boolean;
  title?: string;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  className?: string;
  fileName?: string;
  highlightedLines?: number[];
  tabs?: CodeTabData[];
}

/**
 * Enhanced code block component for documentation and examples
 */
export function CodeBlock({
  code,
  language = "typescript",
  showLineNumbers = true,
  title,
  showCopyButton = true,
  showDownloadButton = false,
  className = "",
  fileName,
  highlightedLines = [],
  tabs,
}: CodeBlockProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Get active code and language
  const activeCode = tabs ? tabs[activeTab].code : code;
  const activeLanguage = tabs ? tabs[activeTab].language : language;

  // Copy to clipboard function
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(activeCode);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Download code as a file
  const downloadCode = (): void => {
    const extensionMap: Record<ProgrammingLanguage, string> = {
      typescript: "ts",
      javascript: "js",
      jsx: "jsx",
      tsx: "tsx",
      json: "json",
      bash: "sh",
      markdown: "md",
      css: "css",
      html: "html",
      scss: "scss",
      python: "py",
      java: "java",
      csharp: "cs",
      go: "go",
      rust: "rs",
      cpp: "cpp",
      text: "txt",
    };

    const extension = extensionMap[activeLanguage];
    const defaultFileName = fileName || `code.${extension}`;

    const blob = new Blob([activeCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFileName;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Language display names and icons omitted for brevity; unchanged
  const languageDisplayNames: Record<ProgrammingLanguage, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    jsx: "JSX",
    tsx: "TSX",
    json: "JSON",
    bash: "Bash",
    markdown: "Markdown",
    css: "CSS",
    html: "HTML",
    scss: "SCSS",
    python: "Python",
    java: "Java",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
    cpp: "C++",
    text: "Plain Text",
  };

  const getLanguageIcon = (lang: ProgrammingLanguage): React.ReactElement => {
    if (lang === "bash") {
      return <Terminal className="h-4 w-4" />;
    }
    return <CodeIcon className="h-4 w-4" />;
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-dark-500 bg-dark-700 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header unchanged */}
      <div className="flex items-center justify-between border-dark-500 border-b bg-dark-600 px-4 py-2">
        <div className="flex items-center space-x-2">
          {title || fileName ? (
            <span className="font-medium text-slate-300">
              {title || fileName}
            </span>
          ) : (
            <Badge
              icon={getLanguageIcon(activeLanguage)}
              variant="primary"
              size="sm"
            >
              {languageDisplayNames[activeLanguage]}
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          {showCopyButton && (
            <motion.button
              onClick={copyToClipboard}
              className="flex items-center rounded p-1 text-slate-400 hover:bg-dark-500 hover:text-primary-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ opacity: isHovered || isCopied ? 1 : 0.7 }}
              title="Copy code"
            >
              {isCopied ? (
                <Check className="h-5 w-5 text-success-400" />
              ) : (
                <ClipboardCopy className="h-5 w-5" />
              )}
            </motion.button>
          )}
          {showDownloadButton && (
            <motion.button
              onClick={downloadCode}
              className="flex items-center rounded p-1 text-slate-400 hover:bg-dark-500 hover:text-primary-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ opacity: isHovered ? 1 : 0.7 }}
              title="Download code"
            >
              <Download className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs unchanged */}
      {tabs && tabs.length > 1 && (
        <div className="flex overflow-x-auto border-dark-500 border-b bg-dark-600/50">
          {tabs.map((tab, index) => (
            <button
              type="button"
              key={index}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                index === activeTab
                  ? "border-t-2 border-t-primary-500 bg-dark-700 text-primary-400"
                  : "text-slate-300 hover:bg-dark-700/30 hover:text-primary-400"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.title}
            </button>
          ))}
        </div>
      )}

      {/* Replace custom processCode with react-syntax-highlighter */}
      <div className={"overflow-x-auto p-4 font-mono text-slate-300 text-sm"}>
        <SyntaxHighlighter
          language={activeLanguage}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = {};
            if (highlightedLines.includes(lineNumber)) {
              style.backgroundColor = "rgba(79,70,229,0.1)"; // primary-500/10
              return { style };
            }
            return {};
          }}
        >
          {activeCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
