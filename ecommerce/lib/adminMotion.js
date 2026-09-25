/*
  Motion patterns for the admin (framer-motion). Every animated admin
  component uses these instead of its own numbers, so the whole
  dashboard moves the same way: short, ease-out, small distances.

  Reduced motion: the root <MotionConfig reducedMotion="user">
  (components/common/MotionProvider.jsx) turns transforms off for
  visitors who ask for less motion; opacity fades stay, briefly.
*/

export const EASE_OUT = [0.22, 1, 0.36, 1];

export const DURATION = {
  fast: 0.16, // dropdowns, badges
  base: 0.24, // modals, pages, toasts
  slow: 0.3, // drawer, sidebar width
};

const base = { duration: DURATION.base, ease: EASE_OUT };

// Main content settling in when a page opens
export const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: base },
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: "easeOut" } },
};

// Overlay behind modals and the mobile drawer
export const overlayVariants = fadeVariants;

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: base },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

// Mobile navigation, in from the left
export const drawerVariants = {
  hidden: { x: "-100%" },
  show: { x: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
  exit: { x: "-100%", transition: { duration: DURATION.base, ease: "easeIn" } },
};

export const dropdownVariants = {
  hidden: { opacity: 0, y: -4 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: "easeIn" } },
};

export const toastVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: base },
  exit: { opacity: 0, y: 6, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

// Repeated items (KPI cards, rows, product cards): a short stagger
export const staggerContainer = (stagger = 0.04) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

export const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: base },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

// Only the first rows of a long list stagger; the rest appear with them
export const rowDelay = (index, stagger = 0.03, cap = 8) => Math.min(index, cap) * stagger;

// List/table rows: pass the row index as `custom`. Only the entrance is
// delayed; removal (exit) is immediate.
export const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (index = 0) => ({ opacity: 1, y: 0, transition: { ...base, delay: rowDelay(index) } }),
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

// Status badge swapping its value (e.g. Processing -> Shipped)
export const badgeSwap = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.1 } },
};

// Sidebar width (px) - AdminShell offsets the content by the same values
export const SIDEBAR_WIDTH = { expanded: 248, collapsed: 66 };
