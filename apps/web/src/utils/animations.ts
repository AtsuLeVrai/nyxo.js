import type { Variants } from "framer-motion";

/**
 * Fade in upward animation variants
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: [0.21, 0.45, 0.27, 0.9],
    },
  }),
};
