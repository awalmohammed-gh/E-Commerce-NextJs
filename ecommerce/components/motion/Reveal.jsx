"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { VIEWPORT, fadeIn, fadeScale, fadeUp, staggerContainer, staggerItem } from "@/lib/storeMotion";

// Named so server components can choose one (functions and objects stay here)
const VARIANTS = { fadeUp, fadeIn, fadeScale };

/*
  Scroll reveals for storefront sections. Client wrappers, so server
  components (homepage sections, footer) can use them without becoming
  client components themselves. Each plays once, when it scrolls in.

    <Reveal>...</Reveal>                     one block fades up
    <Reveal variant="fadeScale">...</Reveal> fades in from 98% scale
    <RevealGroup as="ul"> <RevealItem as="li"> children stagger in

  Never hidden before JavaScript: the server HTML renders fully visible.
  After hydration, only elements still below the fold are tucked away
  (out of sight, so nothing flickers) and revealed as they scroll in.
  Anything already on screen simply stays as it is.
*/
function useScrollReveal() {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, VIEWPORT);

  useLayoutEffect(() => {
    // Measured once, after layout: is this element still below the fold?
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    if (top > window.innerHeight) setArmed(true);
  }, []);

  return { ref, state: !armed || inView ? "show" : "hidden" };
}

export function Reveal({ as = "div", variant = "fadeUp", className, children, ...props }) {
  const Tag = motion[as];
  const { ref, state } = useScrollReveal();
  return (
    <Tag ref={ref} variants={VARIANTS[variant] || fadeUp} initial={false} animate={state} className={className} {...props}>
      {children}
    </Tag>
  );
}

export function RevealGroup({ as = "div", stagger = 0.06, className, children, ...props }) {
  const Tag = motion[as];
  const { ref, state } = useScrollReveal();
  return (
    <Tag ref={ref} variants={staggerContainer(stagger)} initial={false} animate={state} className={className} {...props}>
      {children}
    </Tag>
  );
}

export function RevealItem({ as = "div", className, children, ...props }) {
  const Tag = motion[as];
  return (
    <Tag variants={staggerItem} className={className} {...props}>
      {children}
    </Tag>
  );
}
