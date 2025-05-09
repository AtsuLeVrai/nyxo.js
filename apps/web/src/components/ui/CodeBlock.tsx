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
import { JetBrains_Mono } from "next/font/google";
import type { ReactElement, ReactNode } from "react";
import { useMemo, useState } from "react";

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
}

// Token types for syntax highlighting
type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "function"
  | "property"
  | "variable"
  | "punctuation"
  | "type"
  | "regex"
  | "plain";

interface Token {
  type: TokenType;
  content: string;
}

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

/**
 * Language-specific keywords and patterns for syntax highlighting
 */
const LANGUAGE_PATTERNS: Record<
  ProgrammingLanguage,
  {
    keywords: string[];
    types?: string[];
    operators?: string[];
    punctuation?: string[];
    comments?: { single?: string; multi?: [string, string] };
    strings?: { single?: boolean; double?: boolean; backtick?: boolean };
    functions?: RegExp;
    numbers?: RegExp;
    regex?: RegExp;
  }
> = {
  typescript: {
    keywords: [
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
      "static",
      "public",
      "private",
      "protected",
      "readonly",
      "abstract",
      "namespace",
      "module",
      "declare",
      "type",
    ],
    types: [
      "string",
      "number",
      "boolean",
      "any",
      "object",
      "never",
      "unknown",
      "void",
      "Promise",
      "Array",
      "Record",
      "Map",
      "Set",
    ],
    operators: [
      "=",
      "!",
      ">",
      "<",
      "+",
      "-",
      "*",
      "/",
      "%",
      "?",
      ":",
      "&&",
      "||",
      "??",
      "?.",
      "=>",
      "...",
      "++",
      "--",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "==",
      "===",
      "!=",
      "!==",
      ">=",
      "<=",
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      ">>>",
    ],
    punctuation: [";", ",", ".", "(", ")", "{", "}", "[", "]", "<", ">", "\\"],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { single: true, double: true, backtick: true },
    functions: /\b([a-zA-Z_$][\w$]*)\s*\(/g,
    numbers: /\b\d+(\.\d+)?\b/g,
    regex: /\/([^\\/]|\\.)*\//g,
  },
  javascript: {
    keywords: [
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
    operators: [
      "=",
      "!",
      ">",
      "<",
      "+",
      "-",
      "*",
      "/",
      "%",
      "?",
      ":",
      "&&",
      "||",
      "??",
      "?.",
      "=>",
      "...",
      "++",
      "--",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "==",
      "===",
      "!=",
      "!==",
      ">=",
      "<=",
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      ">>>",
    ],
    punctuation: [";", ",", ".", "(", ")", "{", "}", "[", "]", "<", ">", "\\"],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { single: true, double: true, backtick: true },
    functions: /\b([a-zA-Z_$][\w$]*)\s*\(/g,
    numbers: /\b\d+(\.\d+)?\b/g,
    regex: /\/([^\\/]|\\.)*\//g,
  },
  // Add definitions for other languages as needed
  jsx: {
    keywords: [
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
    operators: ["=", "<", ">", "&", "...", "=>"],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { single: true, double: true, backtick: true },
    functions: /\b([a-zA-Z_$][\w$]*)\s*\(/g,
  },
  tsx: {
    // Combines TypeScript and JSX patterns
    keywords: [
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
      "default",
      "static",
      "public",
      "private",
      "protected",
      "readonly",
    ],
    types: [
      "string",
      "number",
      "boolean",
      "any",
      "object",
      "never",
      "unknown",
      "void",
      "Promise",
      "Array",
      "Record",
      "React",
      "ReactNode",
      "JSX",
      "FC",
      "Component",
    ],
    operators: [
      "=",
      "!",
      ">",
      "<",
      "+",
      "-",
      "*",
      "/",
      "%",
      "?",
      ":",
      "&&",
      "||",
      "??",
      "?.",
      "=>",
      "...",
      "==",
      "===",
      "&",
    ],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { single: true, double: true, backtick: true },
    functions: /\b([a-zA-Z_$][\w$]*)\s*\(/g,
  },
  json: {
    keywords: ["true", "false", "null"],
    punctuation: [":", ",", "{", "}", "[", "]"],
    strings: { double: true },
    numbers: /\b\d+(\.\d+)?\b/g,
  },
  bash: {
    keywords: [
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
    operators: ["-eq", "-ne", "-lt", "-gt", "-le", "-ge", "=", "!="],
    punctuation: ["(", ")", "{", "}", "[", "]", ";", "`"],
    comments: { single: "#" },
    strings: { single: true, double: true },
    variables: /\$\w+|\$\{[^}]+\}/g,
  },
  // Simplified patterns for the remaining languages
  markdown: {
    keywords: [],
    comments: {},
    strings: { single: true, double: true },
  },
  css: {
    keywords: [
      "import",
      "from",
      "@media",
      "@keyframes",
      "@font-face",
      "@import",
      "@charset",
      "@namespace",
      "@supports",
      "@layer",
    ],
    comments: { multi: ["/*", "*/"] },
    strings: { single: true, double: true },
    punctuation: ["{", "}", ";", ":", ",", "(", ")"],
  },
  html: {
    keywords: [],
    comments: { multi: ["<!--", "-->"] },
    strings: { single: true, double: true },
  },
  scss: {
    keywords: [
      "@import",
      "@mixin",
      "@include",
      "@extend",
      "@if",
      "@else",
      "@for",
      "@each",
      "@while",
      "@function",
      "@return",
      "@media",
      "@keyframes",
      "@at-root",
      "@debug",
      "@warn",
      "@error",
    ],
    comments: { multi: ["/*", "*/"], single: "//" },
    strings: { single: true, double: true },
    punctuation: ["{", "}", ";", ":", ",", "(", ")"],
  },
  python: {
    keywords: [
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
    comments: { single: "#" },
    strings: { single: true, double: true },
    functions: /\b([a-zA-Z_]\w*)\s*\(/g,
  },
  java: {
    keywords: [
      "abstract",
      "assert",
      "boolean",
      "break",
      "byte",
      "case",
      "catch",
      "char",
      "class",
      "const",
      "continue",
      "default",
      "do",
      "double",
      "else",
      "enum",
      "extends",
      "final",
      "finally",
      "float",
      "for",
      "if",
      "implements",
      "import",
      "instanceof",
      "int",
      "interface",
      "long",
      "native",
      "new",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "short",
      "static",
      "strictfp",
      "super",
      "switch",
      "synchronized",
      "this",
      "throw",
      "throws",
      "transient",
      "try",
      "void",
      "volatile",
      "while",
      "true",
      "false",
      "null",
    ],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { double: true },
    functions: /\b([a-zA-Z_]\w*)\s*\(/g,
  },
  csharp: {
    keywords: [
      "abstract",
      "as",
      "base",
      "bool",
      "break",
      "byte",
      "case",
      "catch",
      "char",
      "checked",
      "class",
      "const",
      "continue",
      "decimal",
      "default",
      "delegate",
      "do",
      "double",
      "else",
      "enum",
      "event",
      "explicit",
      "extern",
      "false",
      "finally",
      "fixed",
      "float",
      "for",
      "foreach",
      "goto",
      "if",
      "implicit",
      "in",
      "int",
      "interface",
      "internal",
      "is",
      "lock",
      "long",
      "namespace",
      "new",
      "null",
      "object",
      "operator",
      "out",
      "override",
      "params",
      "private",
      "protected",
      "public",
      "readonly",
      "ref",
      "return",
      "sbyte",
      "sealed",
      "short",
      "sizeof",
      "stackalloc",
      "static",
      "string",
      "struct",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "typeof",
      "uint",
      "ulong",
      "unchecked",
      "unsafe",
      "ushort",
      "using",
      "virtual",
      "void",
      "volatile",
      "while",
    ],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { double: true },
    functions: /\b([a-zA-Z_]\w*)\s*\(/g,
  },
  go: {
    keywords: [
      "break",
      "default",
      "func",
      "interface",
      "select",
      "case",
      "defer",
      "go",
      "map",
      "struct",
      "chan",
      "else",
      "goto",
      "package",
      "switch",
      "const",
      "fallthrough",
      "if",
      "range",
      "type",
      "continue",
      "for",
      "import",
      "return",
      "var",
    ],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { double: true, backtick: true },
    functions: /\bfunc\s+([a-zA-Z_]\w*)/g,
  },
  rust: {
    keywords: [
      "as",
      "break",
      "const",
      "continue",
      "crate",
      "else",
      "enum",
      "extern",
      "false",
      "fn",
      "for",
      "if",
      "impl",
      "in",
      "let",
      "loop",
      "match",
      "mod",
      "move",
      "mut",
      "pub",
      "ref",
      "return",
      "self",
      "Self",
      "static",
      "struct",
      "super",
      "trait",
      "true",
      "type",
      "unsafe",
      "use",
      "where",
      "while",
      "async",
      "await",
      "dyn",
    ],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { double: true },
    functions: /\bfn\s+([a-zA-Z_]\w*)/g,
  },
  cpp: {
    keywords: [
      "alignas",
      "alignof",
      "and",
      "and_eq",
      "asm",
      "atomic_cancel",
      "atomic_commit",
      "atomic_noexcept",
      "auto",
      "bitand",
      "bitor",
      "bool",
      "break",
      "case",
      "catch",
      "char",
      "char8_t",
      "char16_t",
      "char32_t",
      "class",
      "compl",
      "concept",
      "const",
      "consteval",
      "constexpr",
      "constinit",
      "const_cast",
      "continue",
      "co_await",
      "co_return",
      "co_yield",
      "decltype",
      "default",
      "delete",
      "do",
      "double",
      "dynamic_cast",
      "else",
      "enum",
      "explicit",
      "export",
      "extern",
      "false",
      "float",
      "for",
      "friend",
      "goto",
      "if",
      "inline",
      "int",
      "long",
      "mutable",
      "namespace",
      "new",
      "noexcept",
      "not",
      "not_eq",
      "nullptr",
      "operator",
      "or",
      "or_eq",
      "private",
      "protected",
      "public",
      "reflexpr",
      "register",
      "reinterpret_cast",
      "requires",
      "return",
      "short",
      "signed",
      "sizeof",
      "static",
      "static_assert",
      "static_cast",
      "struct",
      "switch",
      "synchronized",
      "template",
      "this",
      "thread_local",
      "throw",
      "true",
      "try",
      "typedef",
      "typeid",
      "typename",
      "union",
      "unsigned",
      "using",
      "virtual",
      "void",
      "volatile",
      "wchar_t",
      "while",
      "xor",
      "xor_eq",
    ],
    comments: { single: "//", multi: ["/*", "*/"] },
    strings: { double: true },
    functions: /\b([a-zA-Z_]\w*)\s*\(/g,
  },
  text: {
    keywords: [],
    comments: {},
    strings: {},
  },
};

/**
 * Simple tokenizer for code highlighting
 */
function tokenizeCode(code: string, language: ProgrammingLanguage): Token[][] {
  // Split code into lines
  const lines = code.split("\n");
  const result: Token[][] = [];

  // Get language patterns
  const patterns = LANGUAGE_PATTERNS[language] || LANGUAGE_PATTERNS.text;

  // Basic tokenization - this is a simplified version
  // A production version would use a proper lexer
  for (const line of lines) {
    const lineTokens: Token[] = [];
    let currentIndex = 0;

    // Skip empty lines
    if (line.trim() === "") {
      result.push([{ type: "plain", content: "" }]);
      continue;
    }

    // Tokenize the line
    while (currentIndex < line.length) {
      let matched = false;
      const remaining = line.substring(currentIndex);

      // Check for comments
      if (patterns.comments) {
        // Single-line comments
        if (
          patterns.comments.single &&
          remaining.startsWith(patterns.comments.single)
        ) {
          lineTokens.push({
            type: "comment",
            content: line.substring(currentIndex),
          });
          currentIndex = line.length;
          matched = true;
          continue;
        }

        // Multi-line comments
        if (
          patterns.comments.multi &&
          remaining.startsWith(patterns.comments.multi[0])
        ) {
          const endIndex = line
            .substring(currentIndex + patterns.comments.multi[0].length)
            .indexOf(patterns.comments.multi[1]);

          if (endIndex !== -1) {
            const commentEnd =
              currentIndex +
              patterns.comments.multi[0].length +
              endIndex +
              patterns.comments.multi[1].length;
            lineTokens.push({
              type: "comment",
              content: line.substring(currentIndex, commentEnd),
            });
            currentIndex = commentEnd;
            matched = true;
            continue;
          }
          // Comment extends to end of line
          lineTokens.push({
            type: "comment",
            content: line.substring(currentIndex),
          });
          currentIndex = line.length;
          matched = true;
          continue;
        }
      }

      // Check for strings
      if (patterns.strings) {
        // Single quotes
        if (patterns.strings.single && remaining.startsWith("'")) {
          let endIndex = 1;
          while (
            endIndex < remaining.length &&
            (remaining[endIndex] !== "'" || remaining[endIndex - 1] === "\\")
          ) {
            endIndex++;
          }

          if (endIndex < remaining.length) {
            lineTokens.push({
              type: "string",
              content: remaining.substring(0, endIndex + 1),
            });
            currentIndex += endIndex + 1;
            matched = true;
            continue;
          }
        }

        // Double quotes
        if (patterns.strings.double && remaining.startsWith('"')) {
          let endIndex = 1;
          while (
            endIndex < remaining.length &&
            (remaining[endIndex] !== '"' || remaining[endIndex - 1] === "\\")
          ) {
            endIndex++;
          }

          if (endIndex < remaining.length) {
            lineTokens.push({
              type: "string",
              content: remaining.substring(0, endIndex + 1),
            });
            currentIndex += endIndex + 1;
            matched = true;
            continue;
          }
        }

        // Backticks
        if (patterns.strings.backtick && remaining.startsWith("`")) {
          let endIndex = 1;
          while (
            endIndex < remaining.length &&
            (remaining[endIndex] !== "`" || remaining[endIndex - 1] === "\\")
          ) {
            endIndex++;
          }

          if (endIndex < remaining.length) {
            lineTokens.push({
              type: "string",
              content: remaining.substring(0, endIndex + 1),
            });
            currentIndex += endIndex + 1;
            matched = true;
            continue;
          }
        }
      }

      // Check for keywords
      const word = remaining.match(/^[a-zA-Z0-9_$]+/);
      if (word) {
        const wordValue = word[0];

        if (patterns.keywords?.includes(wordValue)) {
          lineTokens.push({ type: "keyword", content: wordValue });
        } else if (patterns.types?.includes(wordValue)) {
          lineTokens.push({ type: "type", content: wordValue });
        } else {
          // Function detection
          const nextChars = line
            .substring(currentIndex + wordValue.length)
            .match(/^\s*\(/);
          if (nextChars) {
            lineTokens.push({ type: "function", content: wordValue });
          } else {
            lineTokens.push({ type: "variable", content: wordValue });
          }
        }

        currentIndex += wordValue.length;
        matched = true;
        continue;
      }

      // Check for numbers
      const number = remaining.match(/^\d+(\.\d+)?/);
      if (number) {
        lineTokens.push({ type: "number", content: number[0] });
        currentIndex += number[0].length;
        matched = true;
        continue;
      }

      // Check for operators
      if (patterns.operators) {
        const sortedOperators = [...patterns.operators].sort(
          (a, b) => b.length - a.length,
        );
        for (const op of sortedOperators) {
          if (remaining.startsWith(op)) {
            lineTokens.push({ type: "operator", content: op });
            currentIndex += op.length;
            matched = true;
            break;
          }
        }
        if (matched) continue;
      }

      // Check for punctuation
      if (patterns.punctuation) {
        const char = remaining[0];
        if (patterns.punctuation.includes(char)) {
          lineTokens.push({ type: "punctuation", content: char });
          currentIndex++;
          matched = true;
          continue;
        }
      }

      // Default: plain text
      if (!matched) {
        lineTokens.push({ type: "plain", content: remaining[0] });
        currentIndex++;
      }
    }

    result.push(lineTokens);
  }

  return result;
}

/**
 * Render a token with appropriate styling
 */
function renderToken(token: Token, key: string): ReactElement {
  const tokenStyles: Record<TokenType, string> = {
    keyword: "text-primary-400", // Keywords in primary color
    string: "text-green-400", // Strings in green
    number: "text-amber-400", // Numbers in amber
    comment: "text-slate-500 italic", // Comments in slate (muted)
    operator: "text-purple-400", // Operators in purple
    function: "text-cyan-400", // Functions in cyan
    property: "text-yellow-400", // Properties in yellow
    variable: "text-slate-300", // Variables in default text color
    punctuation: "text-slate-400", // Punctuation in slightly muted color
    type: "text-blue-400", // Types in blue
    regex: "text-red-400", // Regex in red
    plain: "text-slate-300", // Plain text in default color
  };

  return (
    <span key={key} className={tokenStyles[token.type]}>
      {token.content}
    </span>
  );
}

/**
 * Render a line of code with tokens
 */
function CodeLine({
  lineNumber,
  tokens,
  isHighlighted,
  showLineNumbers,
}: {
  lineNumber: number;
  tokens: Token[];
  isHighlighted: boolean;
  showLineNumbers: boolean;
}): ReactElement {
  return (
    <div
      className={`flex ${
        isHighlighted ? "bg-primary-500/10" : "hover:bg-dark-600/30"
      }`}
    >
      {showLineNumbers && (
        <div className="select-none pr-4 text-right text-slate-500 w-12">
          {lineNumber}
        </div>
      )}
      <div className="flex-1 overflow-x-auto">
        {tokens.map((token, i) => renderToken(token, `${lineNumber}-${i}`))}
      </div>
    </div>
  );
}

/**
 * Enhanced code block component for displaying formatted code
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
}: CodeBlockProps): ReactElement {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Get active code and language based on tabs or props
  const activeCode = tabs ? tabs[activeTab].code : code;
  const activeLanguage = tabs ? tabs[activeTab].language : language;

  // Tokenize the code for highlighting
  const tokenizedCode = useMemo(
    () => tokenizeCode(activeCode, activeLanguage),
    [activeCode, activeLanguage],
  );

  /**
   * Copy code to clipboard
   */
  function copyToClipboard(): void {
    navigator.clipboard.writeText(activeCode);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  /**
   * Download code as a file
   */
  function downloadCode(): void {
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
  }

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
    if (lang === "bash") {
      return <Terminal className="h-4 w-4" />;
    }
    return <CodeIcon className="h-4 w-4" />;
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-dark-500 bg-dark-700 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with title/language badge and action buttons */}
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
              aria-label="Copy code"
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
              aria-label="Download code"
            >
              <Download className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs if multiple code examples are provided */}
      {tabs && tabs.length > 1 && (
        <div className="flex overflow-x-auto border-dark-500 border-b bg-dark-600/50">
          {tabs.map((tab, index) => (
            <button
              type="button"
              key={tab.title}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                index === activeTab
                  ? "border-t-2 border-t-primary-500 bg-dark-700 text-primary-400"
                  : "text-slate-300 hover:bg-dark-700/30 hover:text-primary-400"
              }`}
              onClick={() => setActiveTab(index)}
              aria-selected={index === activeTab}
              role="tab"
            >
              {tab.title}
            </button>
          ))}
        </div>
      )}

      {/* Code content with custom syntax highlighting */}
      <div
        className={`overflow-x-auto p-4 ${jetBrainsMono.className} text-slate-300 text-sm`}
      >
        <pre className={jetBrainsMono.className}>
          {tokenizedCode.map((lineTokens, lineIndex) => (
            <CodeLine
              key={`line-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                lineIndex
              }`}
              lineNumber={lineIndex + 1}
              tokens={lineTokens}
              isHighlighted={highlightedLines.includes(lineIndex + 1)}
              showLineNumbers={showLineNumbers}
            />
          ))}
        </pre>
      </div>
    </div>
  );
}
