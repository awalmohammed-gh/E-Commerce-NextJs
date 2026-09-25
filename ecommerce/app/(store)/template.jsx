"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/storeMotion";

// Set after the first page has mounted: later mounts are navigations
let hasLoaded = false;

/*
  Next.js remounts a template on every navigation between storefront
  routes, so each new page fades in. The very first, server-rendered
  load is shown as-is (it would otherwise stay hidden until JavaScript
  runs). Opacity only: pages hold fixed bars (bag total, add to bag)
  that a transform on this wrapper would pull out of place.
*/
export default function StoreTemplate({ children }) {
  const [animate] = useState(() => hasLoaded);

  useEffect(() => {
    hasLoaded = true;
  }, []);

  return (
    <motion.div variants={pageTransition} initial={animate ? "hidden" : false} animate="show">
      {children}
    </motion.div>
  );
}
