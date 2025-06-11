"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useInView } from "react-intersection-observer";

export interface FadeInProps {
  /** Child elements to render with the fade effect */
  children: ReactNode;
  /** Delay before starting animation (in seconds) */
  delay?: number;
  /** Animation duration (in seconds) */
  duration?: number;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Direction of fade animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Class name to apply to the container */
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  direction = "up",
  className = "",
}: FadeInProps) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  // Determine the initial values based on direction
  const directionOffset = 20;
  const initial = {
    opacity: 0,
    y:
      direction === "up"
        ? directionOffset
        : direction === "down"
          ? -directionOffset
          : 0,
    x:
      direction === "left"
        ? directionOffset
        : direction === "right"
          ? -directionOffset
          : 0,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
