"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface AnimatedTextProps {
  /** Text to animate */
  text: string;
  /** Optional class name */
  className?: string;
  /** Delay before starting animation (in seconds) */
  delay?: number;
}

/**
 * Animates text letter by letter with a staggered effect
 */
export function AnimatedText({
  text,
  className = "",
  delay = 0,
}: AnimatedTextProps) {
  // Split the text into individual characters
  const letters = Array.from(text);

  // Container animation variants
  const container = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  // Individual letter animation variants
  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            index
          }`}
          variants={child}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

export interface HighlightTextProps {
  /** Base text content */
  children: ReactNode;
  /** Words to highlight */
  highlights: string[];
  /** Highlight color class */
  highlightClassName?: string;
}

/**
 * Highlights specific words in text
 */
export function HighlightText({
  children,
  highlights,
  highlightClassName = "text-primary-400",
}: HighlightTextProps) {
  if (typeof children !== "string") {
    return <>{children}</>;
  }

  const text = children as string;
  const parts = text.split(new RegExp(`(${highlights.join("|")})`, "gi"));

  return (
    <>
      {parts.map((part, i) => {
        const isHighlighted = highlights.some(
          (h) => part.toLowerCase() === h.toLowerCase(),
        );

        return isHighlighted ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <span key={i} className={highlightClassName}>
            {part}
          </span>
        ) : (
          part
        );
      })}
    </>
  );
}
