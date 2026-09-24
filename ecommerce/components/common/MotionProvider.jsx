"use client";

import { MotionConfig } from "framer-motion";

// Framer animations follow the visitor's reduced-motion setting
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
