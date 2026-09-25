/*
  Motion patterns for the storefront (framer-motion). Components use
  these instead of their own numbers so the whole site moves alike.

  Timing scale
    micro     ~150ms  icons, counters, hover feedback, dropdowns
    standard  ~250ms  cards, menus, toasts, messages
    entrance  ~500ms  sections and product grids scrolling into view

  Reduced motion: the root <MotionConfig reducedMotion="user">
  (components/common/MotionProvider.jsx) drops transforms for visitors
  who ask for less motion; only short opacity fades remain.

  First paint: content that is visible on load (hero, sign-in form)
  animates with CSS instead, so it never waits for JavaScript. These
  variants are for navigation, scroll reveals and state changes.
*/

export const EASE_OUT = [0.22, 1, 0.36, 1];

export const DURATION = {
  micro: 0.15,
  standard: 0.25,
  entrance: 0.5,
};

// Between routes: opacity only, so fixed bars inside pages never shift
export const pageTransition = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.standard, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: DURATION.micro, ease: "easeIn" } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.entrance, ease: EASE_OUT } },
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.entrance, ease: EASE_OUT } },
};

export const staggerContainer = (stagger = 0.06, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

// Messages that appear and disappear (errors, "added to bag")
export const messageVariants = {
  hidden: { opacity: 0, y: -4 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: DURATION.micro } },
};

export const dropdown = {
  hidden: { opacity: 0, y: -6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: "easeIn" } },
};

// Scroll reveals run once, a little before the element is fully in view
export const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" };

// Product cards: short stagger across a row, never a long queue
export const cardDelay = (index, perRow = 4) => (index % perRow) * 0.06;

// Product cards scrolling into view; pass the card index as `custom`
export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay: cardDelay(index) },
  }),
};
