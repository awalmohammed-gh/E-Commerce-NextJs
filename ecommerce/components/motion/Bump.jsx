"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/*
  A quick scale pulse (1 -> `scale` -> 1) whenever `value` changes:
  the bag count going up, a heart being saved. Nothing plays on the
  first render, so counts don't pulse on every page load.
*/
export default function Bump({ value, scale = 1.1, className = "", children }) {
  const [last, setLast] = useState(value);
  const [changes, setChanges] = useState(0);

  if (value !== last) {
    setLast(value);
    setChanges((n) => n + 1);
  }

  return (
    <motion.span
      key={changes}
      className={`inline-flex ${className}`}
      initial={changes ? { scale: 1 } : false}
      animate={changes ? { scale: [1, scale, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.span>
  );
}
