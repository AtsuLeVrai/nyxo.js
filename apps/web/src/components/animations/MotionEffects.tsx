"use client";

import { motion, useAnimation } from "framer-motion";
import type React from "react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

/**
 * Component that fades in when it becomes visible in the viewport
 */
export function FadeInWhenVisible({
  children,
  delay = 0,
  duration = 0.5,
  threshold = 0.2,
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}) {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: once,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [controls, inView, once]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
