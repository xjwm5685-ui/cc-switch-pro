import type { Transition, Variants } from "framer-motion";

/** Soft desktop-app spring — used for sliding active indicators */
export const indicatorSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
};

/** Short ease for page / panel content swaps */
export const contentEase: Transition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeSlide: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export const fadeSlideSlow: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export const fadeOnly: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const panelSlide: Variants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
};

export const emptyState: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const emptyStateChild: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

export const headerTitle: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};
