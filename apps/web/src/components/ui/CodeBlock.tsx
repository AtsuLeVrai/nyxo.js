"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Code as CodeIcon,
  Copy,
  Download,
  FileText,
  Terminal,
} from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import type { ReactElement } from "react";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Badge } from "~/components/ui/Badge";

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

export interface CodeTabData {
  /** Title to display on the tab */
  title: string;
  /** Programming language for syntax highlighting */
  language: ProgrammingLanguage;
  /** Code content to display */
  code: string;
}

export interface CodeBlockProps {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: ProgrammingLanguage;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Optional title for the code block */
  title?: string;
  /** Whether to show copy button */
  showCopyButton?: boolean;
  /** Whether to show download button */
  showDownloadButton?: boolean;
  /** Additional class names */
  className?: string;
  /** Filename for download */
  fileName?: string;
  /** Line numbers to highlight */
  highlightedLines?: number[];
  /** Tabs for multiple code examples */
  tabs?: CodeTabData[];
  /** Maximum height before scrolling */
  maxHeight?: string;
  /** Test ID for testing */
  "data-testid"?: string;
}

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

// Simplified token types for basic syntax highlighting
type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "plain";

interface Token {
  type: TokenType;
  content: string;
}

// Simplified language patterns for better performance
const LANGUAGE_KEYWORDS: Record<ProgrammingLanguage, string[]> = {
  typescript: [
    "const",
    "let",
    "var",
    "function",
    "class",
    "interface",
    "enum",
    "export",
    "import",
    "from",
    "extends",
    "implements",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "default",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "delete",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "this",
    "true",
    "false",
    "await",
    "async",
    "as",
    "type",
    "string",
    "number",
    "boolean",
    "any",
    "object",
    "never",
    "unknown",
    "Promise",
    "Array",
  ],
  javascript: [
    "const",
    "let",
    "var",
    "function",
    "class",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "default",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "delete",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "this",
    "true",
    "false",
    "await",
    "async",
    "yield",
    "extends",
    "super",
    "import",
    "export",
    "from",
  ],
  jsx: [
    "const",
    "let",
    "var",
    "function",
    "class",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "default",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "delete",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "this",
    "true",
    "false",
    "await",
    "async",
    "extends",
    "import",
    "export",
    "from",
    "as",
    "props",
    "state",
    "default",
  ],
  tsx: [
    "const",
    "let",
    "var",
    "function",
    "class",
    "interface",
    "enum",
    "export",
    "import",
    "from",
    "extends",
    "implements",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "default",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "delete",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "this",
    "true",
    "false",
    "await",
    "async",
    "as",
    "props",
    "state",
    "type",
    "string",
    "number",
    "boolean",
    "React",
    "ReactNode",
    "JSX",
    "FC",
    "Component",
  ],
  json: ["true", "false", "null"],
  bash: [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "while",
    "do",
    "done",
    "for",
    "in",
    "case",
    "esac",
    "function",
    "echo",
    "exit",
    "return",
    "set",
    "local",
    "export",
    "unset",
  ],
  python: [
    "def",
    "class",
    "if",
    "else",
    "elif",
    "while",
    "for",
    "in",
    "try",
    "except",
    "finally",
    "with",
    "as",
    "import",
    "from",
    "return",
    "yield",
    "break",
    "continue",
    "pass",
    "raise",
    "assert",
    "del",
    "global",
    "nonlocal",
    "True",
    "False",
    "None",
    "and",
    "or",
    "not",
    "is",
    "lambda",
    "async",
    "await",
  ],
  // Add other languages as needed with reduced keyword sets
  markdown: [],
  css: ["import", "from", "@media", "@keyframes", "@font-face"],
  html: [],
  scss: [
    "@import",
    "@mixin",
    "@include",
    "@extend",
    "@if",
    "@else",
    "@for",
    "@each",
  ],
  java: [
    "public",
    "private",
    "protected",
    "class",
    "interface",
    "extends",
    "implements",
  ],
  csharp: [
    "public",
    "private",
    "protected",
    "class",
    "interface",
    "namespace",
    "using",
  ],
  go: [
    "func",
    "package",
    "import",
    "var",
    "const",
    "type",
    "struct",
    "interface",
  ],
  rust: [
    "fn",
    "let",
    "mut",
    "const",
    "struct",
    "enum",
    "impl",
    "trait",
    "mod",
    "use",
  ],
  cpp: [
    "class",
    "struct",
    "namespace",
    "using",
    "template",
    "typename",
    "const",
  ],
  text: [],
};

/**
 * Simplified tokenizer for better performance
 */
function tokenizeCode(code: string, language: ProgrammingLanguage): Token[][] {
  const lines = code.split("\n");
  const keywords = LANGUAGE_KEYWORDS[language] || [];

  return lines.map((line) => {
    const tokens: Token[] = [];
    if (!line.trim()) {
      return [{ type: "plain", content: "" }];
    }

    let currentIndex = 0;
    while (currentIndex < line.length) {
      const remaining = line.substring(currentIndex);

      // Check for comments
      if (remaining.startsWith("//") || remaining.startsWith("#")) {
        tokens.push({ type: "comment", content: line.substring(currentIndex) });
        break;
      }

      if (remaining.startsWith("/*")) {
        const endIndex = line.indexOf("*/", currentIndex + 2);
        if (endIndex !== -1) {
          tokens.push({
            type: "comment",
            content: line.substring(currentIndex, endIndex + 2),
          });
          currentIndex = endIndex + 2;
          continue;
        }
      }

      // Check for strings
      const stringChars = ["'", '"', "`"];
      let stringFound = false;
      for (const char of stringChars) {
        if (remaining.startsWith(char)) {
          let endIndex = 1;
          while (endIndex < remaining.length && remaining[endIndex] !== char) {
            if (remaining[endIndex] === "\\") endIndex++; // Skip escaped characters
            endIndex++;
          }
          if (endIndex < remaining.length) {
            tokens.push({
              type: "string",
              content: remaining.substring(0, endIndex + 1),
            });
            currentIndex += endIndex + 1;
            stringFound = true;
            break;
          }
        }
      }
      if (stringFound) continue;

      // Check for numbers
      const numberMatch = remaining.match(/^\d+(\.\d+)?/);
      if (numberMatch) {
        tokens.push({ type: "number", content: numberMatch[0] });
        currentIndex += numberMatch[0].length;
        continue;
      }

      // Check for words (potential keywords)
      const wordMatch = remaining.match(/^[a-zA-Z_$][\w$]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        const type = keywords.includes(word) ? "keyword" : "plain";
        tokens.push({ type, content: word });
        currentIndex += word.length;
        continue;
      }

      // Check for operators
      const operatorChars = [
        "=",
        "+",
        "-",
        "*",
        "/",
        "%",
        "!",
        "<",
        ">",
        "&",
        "|",
        "?",
        ":",
      ];
      if (operatorChars.includes(remaining[0] as string)) {
        tokens.push({ type: "operator", content: remaining[0] as string });
        currentIndex++;
        continue;
      }

      // Default: plain text
      tokens.push({ type: "plain", content: remaining[0] as string });
      currentIndex++;
    }

    return tokens;
  });
}

/**
 * Render a token with appropriate styling
 */
function renderToken(token: Token, key: string) {
  const tokenStyles: Record<TokenType, string> = {
    keyword: "text-primary-400 font-medium",
    string: "text-green-400",
    number: "text-amber-400",
    comment: "text-slate-500 italic",
    operator: "text-purple-400",
    plain: "text-slate-300",
  };

  return (
    <span key={key} className={tokenStyles[token.type]}>
      {token.content}
    </span>
  );
}

/**
 * Enhanced code block component with improved performance
 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
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
      maxHeight = "400px",
      "data-testid": testId,
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const shouldReduceMotion = useReducedMotion();

    // Get active code and language based on tabs or props
    const activeCode = tabs ? tabs[activeTab]?.code || "" : code;
    const activeLanguage = tabs
      ? tabs[activeTab]?.language || "text"
      : language;

    // Memoized tokenized code for better performance
    const tokenizedCode = useMemo(
      () => tokenizeCode(activeCode, activeLanguage),
      [activeCode, activeLanguage],
    );

    /**
     * Copy code to clipboard with error handling
     */
    const copyToClipboard = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(activeCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy code:", error);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = activeCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    }, [activeCode]);

    /**
     * Download code as a file
     */
    const downloadCode = useCallback(() => {
      const extensionMap: Partial<Record<ProgrammingLanguage, string>> = {
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

      const extension = extensionMap[activeLanguage] || "txt";
      const defaultFileName = fileName || `code.${extension}`;

      const blob = new Blob([activeCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = defaultFileName;
      a.click();

      URL.revokeObjectURL(url);
    }, [activeCode, activeLanguage, fileName]);

    // Language display names for UI
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

    /**
     * Get appropriate language icon
     */
    function getLanguageIcon(lang: ProgrammingLanguage): ReactElement {
      if (lang === "bash") return <Terminal className="h-4 w-4" />;
      if (lang === "markdown") return <FileText className="h-4 w-4" />;
      return <CodeIcon className="h-4 w-4" />;
    }

    return (
      <div
        ref={ref}
        className={`overflow-hidden rounded-lg border border-dark-500 bg-dark-700/80 backdrop-blur-sm ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={testId}
      >
        {/* Header with title/language badge and action buttons */}
        <div className="flex items-center justify-between border-dark-500/50 border-b bg-dark-600/50 px-4 py-3">
          <div className="flex items-center space-x-3">
            {title || fileName ? (
              <span className="truncate font-medium text-slate-300">
                {title || fileName}
              </span>
            ) : (
              <Badge
                icon={getLanguageIcon(activeLanguage)}
                variant="primary"
                size="sm"
                animated={!shouldReduceMotion}
              >
                {languageDisplayNames[activeLanguage]}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showCopyButton && (
              <motion.button
                onClick={copyToClipboard}
                className="flex items-center rounded-md p-2 text-slate-400 transition-colors hover:bg-dark-500/50 hover:text-primary-400"
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                animate={{ opacity: isHovered || isCopied ? 1 : 0.7 }}
                title="Copy code"
                aria-label="Copy code to clipboard"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </motion.button>
            )}
            {showDownloadButton && (
              <motion.button
                onClick={downloadCode}
                className="flex items-center rounded-md p-2 text-slate-400 transition-colors hover:bg-dark-500/50 hover:text-primary-400"
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                animate={{ opacity: isHovered ? 1 : 0.7 }}
                title="Download code"
                aria-label="Download code as file"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Tabs if multiple code examples are provided */}
        {tabs && tabs.length > 1 && (
          <div className="flex overflow-x-auto border-dark-500/50 border-b bg-dark-600/30">
            {tabs.map((tab, index) => (
              <button
                type="button"
                key={tab.title}
                className={`whitespace-nowrap px-4 py-2 font-medium text-sm transition-colors ${
                  index === activeTab
                    ? "border-t-2 border-t-primary-500 bg-dark-700/50 text-primary-400"
                    : "text-slate-300 hover:bg-dark-700/30 hover:text-primary-400"
                }`}
                onClick={() => setActiveTab(index)}
                aria-selected={index === activeTab}
                role="tab"
                tabIndex={index === activeTab ? 0 : -1}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Code content with syntax highlighting */}
        <div
          className={`overflow-auto p-4 ${jetBrainsMono.className}`}
          style={{ maxHeight }}
        >
          <pre className={`${jetBrainsMono.className} text-sm leading-relaxed`}>
            {tokenizedCode.map((lineTokens, lineIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={lineIndex}
                className={`flex ${
                  highlightedLines.includes(lineIndex + 1)
                    ? "border-l-2 border-l-primary-500 bg-primary-500/10 pl-2"
                    : "hover:bg-dark-600/20"
                }`}
              >
                {showLineNumbers && (
                  <div className="w-12 select-none pr-4 text-right text-slate-500 text-xs leading-relaxed">
                    {lineIndex + 1}
                  </div>
                )}
                <div className="flex-1 overflow-x-auto">
                  {lineTokens.map((token, tokenIndex) =>
                    renderToken(token, `${lineIndex}-${tokenIndex}`),
                  )}
                </div>
              </div>
            ))}
          </pre>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";
