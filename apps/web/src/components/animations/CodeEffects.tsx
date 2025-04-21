"use client";

import { motion } from "framer-motion";
import React from "react";

// Types pour la syntaxe des segments de code
type CodeSegmentType = "keyword" | "comment" | "string" | "type" | "normal";

interface CodeSegment {
  text: string;
  type: CodeSegmentType;
}

/**
 * Reveals code line by line with a typing effect
 */
export function CodeReveal({
  code,
  delay = 0.5,
  showLineNumbers = false,
  language = "typescript",
}: {
  code: string;
  delay?: number;
  showLineNumbers?: boolean;
  language?: string;
}) {
  const lines = code.split("\n");

  // Parse the line into segments for proper syntax highlighting
  const parseCodeLine = (text: string, lang: string): CodeSegment[] => {
    if (!text) return [{ text: "\u00A0", type: "normal" }];

    // If not a supported language, return as normal text
    if (lang !== "typescript" && lang !== "javascript") {
      return [{ text, type: "normal" }];
    }

    // Array to hold all segments
    const segments: CodeSegment[] = [];

    // Use a temporary element to store remaining text as we process it
    let remaining = text;

    // Process keywords
    const keywordRegex =
      /(import|export|from|const|let|var|function|return|new|class|interface|extends|implements|if|else|for|while|switch|case|break|default|try|catch|finally|throw|async|await)(?=\W|$)/g;

    // Find all keywords
    const keywordMatches = [...remaining.matchAll(keywordRegex)];

    // Process each keyword match from end to beginning to avoid index shifting
    for (let i = keywordMatches.length - 1; i >= 0; i--) {
      const match = keywordMatches[i];
      if (match.index !== undefined) {
        const keyword = match[0];
        const beforeKeyword = remaining.substring(0, match.index);
        const afterKeyword = remaining.substring(match.index + keyword.length);

        // Replace the original string with parts before and after the keyword
        remaining = beforeKeyword + afterKeyword;

        // Add the segmented parts (in reverse order so they'll be correct when we reverse the array later)
        segments.unshift({ text: keyword, type: "keyword" });
        if (afterKeyword)
          segments.unshift({ text: afterKeyword, type: "normal" });
      }
    }

    // Add any remaining text after processing keywords
    if (remaining) {
      segments.unshift({ text: remaining, type: "normal" });
    }

    // Now process remaining segments for other syntax elements
    const processedSegments: CodeSegment[] = [];

    for (const segment of segments) {
      if (segment.type !== "normal") {
        processedSegments.push(segment);
        return processedSegments;
      }

      const text = segment.text;

      // Check for comments
      const commentMatch = text.match(/(\/\/.*$)/);
      if (commentMatch) {
        const commentStartIndex = commentMatch.index || 0;
        const beforeComment = text.substring(0, commentStartIndex);
        const comment = commentMatch[0];

        if (beforeComment) {
          processedSegments.push({ text: beforeComment, type: "normal" });
        }
        processedSegments.push({ text: comment, type: "comment" });
        return processedSegments;
      }

      // Check for strings (simplified - doesn't handle escapes perfectly)
      const currentText = text;
      const stringRegex = /(['"`])(.*?)(['"`])/g;
      const stringMatch: RegExpExecArray | null = stringRegex.exec(currentText);

      let lastIndex = 0;
      while (stringMatch !== null) {
        const fullMatch = stringMatch[0];
        const matchIndex = stringMatch.index;

        // Add normal text before the string
        if (matchIndex > lastIndex) {
          processedSegments.push({
            text: currentText.substring(lastIndex, matchIndex),
            type: "normal",
          });
        }

        // Add the string
        processedSegments.push({ text: fullMatch, type: "string" });

        lastIndex = matchIndex + fullMatch.length;
      }

      // Add any remaining text
      if (lastIndex < currentText.length) {
        processedSegments.push({
          text: currentText.substring(lastIndex),
          type: "normal",
        });
      }
    }

    return processedSegments;
  };

  // Render a specific segment based on its type
  const renderSegment = (segment: CodeSegment, index: number) => {
    const { text, type } = segment;

    switch (type) {
      case "keyword":
        return (
          <span key={index} className="text-purple-400">
            {text}
          </span>
        );
      case "comment":
        return (
          <span key={index} className="text-slate-500">
            {text}
          </span>
        );
      case "string":
        return (
          <span key={index} className="text-green-400">
            {text}
          </span>
        );
      case "type":
        return (
          <span key={index} className="text-cyan-400">
            {text}
          </span>
        );
      default:
        return <span key={index}>{text}</span>;
    }
  };

  return (
    <div className="font-mono text-slate-300 text-sm">
      {lines.map((line, lineIndex) => (
        <motion.div
          key={lineIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + lineIndex * 0.15 }}
          className="flex"
        >
          {showLineNumbers && (
            <span className="mr-4 inline-block w-5 text-right text-slate-500">
              {lineIndex + 1}
            </span>
          )}

          <div className="flex-1">
            {parseCodeLine(line, language).map((segment, segIndex) =>
              renderSegment(segment, segIndex),
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
