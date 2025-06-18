"use client";

import { Check, Copy } from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import { useState } from "react";

/**
 * Supported programming languages for syntax highlighting
 */
type Language =
  | "typescript"
  | "javascript"
  | "jsx"
  | "tsx"
  | "json"
  | "bash"
  | "css"
  | "html";

/**
 * Props for the CodeBlock component
 */
interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: Language;
  /** Optional title to display in the header */
  title?: string;
  /** Whether to show the copy button */
  showCopy?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * JetBrains Mono font configuration for code display
 */
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

/**
 * Represents a syntax token with its type and content
 */
interface Token {
  /** The type of syntax token */
  type: "keyword" | "string" | "number" | "comment" | "text";
  /** The actual text content of the token */
  content: string;
  /** Unique identifier for React key prop */
  key: string;
}

/**
 * Tokenizes code string into syntax-highlighted tokens
 * @param code - The source code to tokenize
 * @param language - The programming language for context-aware tokenization
 * @returns Array of tokens with type and content information
 */
function tokenizeCode(code: string, language: Language): Token[] {
  // Language-specific keyword definitions
  const keywords: Record<Language, string[]> = {
    typescript: [
      "const",
      "let",
      "var",
      "function",
      "class",
      "interface",
      "type",
      "export",
      "import",
      "from",
      "return",
      "if",
      "else",
    ],
    javascript: [
      "const",
      "let",
      "var",
      "function",
      "class",
      "export",
      "import",
      "from",
      "return",
      "if",
      "else",
    ],
    jsx: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "export",
      "import",
      "from",
    ],
    tsx: [
      "const",
      "let",
      "var",
      "function",
      "interface",
      "type",
      "return",
      "export",
      "import",
      "from",
    ],
    json: ["true", "false", "null"],
    bash: ["echo", "cd", "ls", "mkdir", "npm", "yarn", "git"],
    css: ["display", "position", "color", "background", "margin", "padding"],
    html: [],
  };

  const tokens: Token[] = [];
  const keywordSet = new Set(keywords[language] || []);
  let currentIndex = 0;

  // Regex patterns for different token types
  const patterns = [
    // Multi-line comments (/* ... */)
    { type: "comment" as const, regex: /\/\*[\s\S]*?\*\//g },
    // Single-line comments (// ...)
    { type: "comment" as const, regex: /\/\/.*$/gm },
    // Double-quoted strings
    { type: "string" as const, regex: /"(?:\\.|[^"\\])*"/g },
    // Single-quoted strings
    { type: "string" as const, regex: /'(?:\\.|[^'\\])*'/g },
    // Template literals (`...`)
    { type: "string" as const, regex: /`(?:\\.|[^`\\])*`/g },
    // Numeric literals
    { type: "number" as const, regex: /\b\d+\.?\d*\b/g },
  ];

  // Find all matches for all patterns
  const allMatches: Array<{
    type: Token["type"];
    start: number;
    end: number;
    content: string;
  }> = [];

  // Execute all regex patterns and collect matches
  for (const { type, regex } of patterns) {
    let match;
    regex.lastIndex = 0; // Reset regex state to avoid issues
    while ((match = regex.exec(code)) !== null) {
      allMatches.push({
        type,
        start: match.index,
        end: match.index + match[0].length,
        content: match[0],
      });
    }
  }

  // Sort matches by their position in the code
  allMatches.sort((a, b) => a.start - b.start);

  // Process code token by token
  let tokenKey = 0;

  for (const match of allMatches) {
    // Add text content before current match
    if (currentIndex < match.start) {
      const textBefore = code.slice(currentIndex, match.start);
      // Split text into words to identify keywords
      const words = textBefore.split(/(\s+|\b)/);
      for (const word of words) {
        if (word.trim()) {
          const isKeyword = keywordSet.has(word.trim());
          tokens.push({
            type: isKeyword ? "keyword" : "text",
            content: word,
            key: `token-${tokenKey++}`,
          });
        } else if (word) {
          // Preserve whitespace characters
          tokens.push({
            type: "text",
            content: word,
            key: `token-${tokenKey++}`,
          });
        }
      }
    }

    // Add the current match as a token
    tokens.push({
      type: match.type,
      content: match.content,
      key: `token-${tokenKey++}`,
    });

    currentIndex = match.end;
  }

  // Add remaining text after the last match
  if (currentIndex < code.length) {
    const remainingText = code.slice(currentIndex);
    const words = remainingText.split(/(\s+|\b)/);
    for (const word of words) {
      if (word.trim()) {
        const isKeyword = keywordSet.has(word.trim());
        tokens.push({
          type: isKeyword ? "keyword" : "text",
          content: word,
          key: `token-${tokenKey++}`,
        });
      } else if (word) {
        tokens.push({
          type: "text",
          content: word,
          key: `token-${tokenKey++}`,
        });
      }
    }
  }

  return tokens;
}

/**
 * Renders a single syntax token with appropriate styling
 * @param token - The token object containing type and content
 * @returns JSX element with styled token
 */
function TokenSpan({ token }: { token: Token }) {
  /**
   * Returns CSS classes based on token type for syntax highlighting
   * @param type - The type of the syntax token
   * @returns Tailwind CSS classes for styling
   */
  const getTokenClassName = (type: Token["type"]) => {
    switch (type) {
      case "keyword":
        return "text-primary-400 font-medium";
      case "string":
        return "text-green-400";
      case "number":
        return "text-amber-400";
      case "comment":
        return "text-slate-500 italic";
      default:
        return "text-slate-300";
    }
  };

  return (
    <span key={token.key} className={getTokenClassName(token.type)}>
      {token.content}
    </span>
  );
}

/**
 * A syntax-highlighted code block component with copy functionality
 *
 * Features:
 * - Syntax highlighting for multiple languages
 * - Copy to clipboard functionality
 * - Customizable title and styling
 * - Responsive design with horizontal scrolling
 *
 * @param props - Component props
 * @returns Styled code block with syntax highlighting
 */
export function CodeBlock({
  code,
  language = "typescript",
  title,
  showCopy = true,
  className = "",
}: CodeBlockProps) {
  // State for copy button feedback
  const [copied, setCopied] = useState(false);

  /**
   * Copies the code content to clipboard and shows feedback
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      // Reset copy state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {}
  };

  // Human-readable language names for display
  const languageNames: Record<Language, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    jsx: "JSX",
    tsx: "TSX",
    json: "JSON",
    bash: "Bash",
    css: "CSS",
    html: "HTML",
  };

  // Tokenize the code for syntax highlighting
  const tokens = tokenizeCode(code, language);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-dark-500 bg-dark-700/80 ${className}`}
    >
      {/* Header with title and copy button */}
      <div className="flex items-center justify-between border-dark-500/50 border-b bg-dark-600/50 px-4 py-3">
        <span className="font-medium text-slate-300 text-sm">
          {title || languageNames[language]}
        </span>
        {showCopy && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-1 text-slate-400 transition-colors hover:text-primary-400"
            title="Copy code to clipboard"
            aria-label={copied ? "Code copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Code content with syntax highlighting */}
      <div className="overflow-x-auto p-4">
        <pre className="text-slate-300 text-sm">
          <code className={jetBrainsMono.className}>
            {tokens.map((token) => (
              <TokenSpan key={token.key} token={token} />
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
