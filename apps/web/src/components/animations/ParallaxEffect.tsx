"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { type ReactNode, useRef } from "react";

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  direction?: "up" | "down";
  className?: string;
}

export function ParallaxEffect({
  children,
  speed = 0.5,
  direction = "up",
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const multiplier = direction === "down" ? speed : -speed;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${multiplier * 100}%`],
  );

  return (
    <motion.div ref={ref} style={{ y }} className={`relative ${className}`}>
      {children}
    </motion.div>
  );
}
