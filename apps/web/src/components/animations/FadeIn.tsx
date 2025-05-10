"use client";

import { motion } from "framer-motion";
import type { ReactNode, RefObject } from "react";
import { useInView } from "~/hooks/useInView";

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

/**
 * Component that smoothly fades in when it becomes visible in the viewport
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  direction = "up",
  className = "",
}: FadeInProps) {
  const { ref, isInView } = useInView({
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
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
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

/**
 * Variant for staggered animations of multiple children
 */
export function FadeInStagger({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <motion.div
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animation variants that can be used with motion components
 */
export const fadeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),

  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  },
};
