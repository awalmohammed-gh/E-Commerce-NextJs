"use client";

import { useEffect, useEffectEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/* ------------------------------------------------------------------
   Environment hooks (read without effects, safe during SSR)
------------------------------------------------------------------ */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function subscribeVisibility(callback) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);

const usePageVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);

/* ------------------------------------------------------------------
   Controls: pause/play, previous, position dots, next
------------------------------------------------------------------ */
function Controls({ count, active, playing, canAutoplay, showPauseButton, interval, tone, onGo, onToggle, labelId }) {
  const light = tone === "light";
  const button = `flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
    light ? "text-cream hover:bg-cream/15" : "text-ink hover:bg-ink/5"
  }`;
  const track = light ? "bg-cream/35" : "bg-ink/15";
  const fill = light ? "bg-cream" : "bg-ink";

  return (
    <div className="flex items-center gap-1">
      {canAutoplay && showPauseButton && (
        <button
          type="button"
          onClick={onToggle}
          className={button}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}

      <button type="button" onClick={() => onGo(active - 1)} className={button} aria-label="Previous slide" aria-controls={labelId}>
        <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
      </button>

      <div className="flex items-center" role="group" aria-label="Choose a slide">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onGo(i)}
            aria-label={`Show slide ${i + 1} of ${count}`}
            aria-current={i === active ? "true" : undefined}
            aria-controls={labelId}
            className="flex h-10 items-center px-1.5"
          >
            <span className={`relative block h-0.5 overflow-hidden rounded-full transition-[width] duration-300 ${track} ${i === active ? "w-10" : "w-5"}`}>
              {i === active && (
                <span
                  // Visual timer: fills over `interval` and freezes whenever auto-play
                  // pauses, in step with the timer in Slideshow
                  key={`${active}-${canAutoplay}`}
                  className={`absolute inset-0 origin-left ${fill}`}
                  style={
                    canAutoplay
                      ? { animation: `slideshow-progress ${interval}ms linear forwards`, animationPlayState: playing ? "running" : "paused" }
                      : undefined
                  }
                />
              )}
            </span>
          </button>
        ))}
      </div>

      <button type="button" onClick={() => onGo(active + 1)} className={button} aria-label="Next slide" aria-controls={labelId}>
        <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
      </button>
    </div>
  );
}

/*
  Reusable, data-driven slideshow (homepage hero, shop banner).

  slides:       array of slide data (any shape)
  renderSlide:  (slide, { index, active, priority, loadImages }) => JSX
                - priority:   true for the first slide (LCP image)
                - loadImages: false for slides not yet needed, so their
                              images don't compete with the first one
  renderControls: (controls) => JSX, to place the controls in the layout
  interval:     ms per slide when auto-playing
  showPauseButton: false hides the pause/play button (auto-play still
                pauses on hover, focus and hidden tabs)

  Behaviour: crossfade between slides stacked in one grid cell (the
  tallest slide sets the height, so nothing shifts); auto-play pauses
  on hover, keyboard focus, the pause button, or a hidden tab, and is
  off when the visitor prefers reduced motion. Swipe on touch screens,
  arrow keys when focused. Hidden slides are inert and aria-hidden.
*/
export default function Slideshow({
  slides,
  renderSlide,
  renderControls,
  label,
  interval = 6500,
  showPauseButton = true,
  tone = "dark",
  className = "",
  trackClassName = "",
}) {
  const count = slides.length;
  const regionId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();

  const [active, setActive] = useState(0);
  // Slides whose images may load: the current one and the next in line
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % Math.max(count, 1)]));
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const pointer = useRef(null);

  const canAutoplay = count > 1 && !reducedMotion;
  const playing = canAutoplay && !userPaused && !hovering && !focused && pageVisible;

  const goTo = (index) => {
    const next = (index + count) % count;
    setActive(next);
    setLoaded((current) => {
      const upcoming = (next + 1) % count;
      if (current.has(next) && current.has(upcoming)) return current;
      return new Set([...current, next, upcoming]);
    });
  };

  /*
    Auto-play timer. `remaining` holds the time left on the current
    slide: pausing stops the timeout and subtracts the time already
    shown, resuming schedules only what's left. A new slide starts
    with the full interval.
  */
  const remaining = useRef(interval);
  const advance = useEffectEvent(() => goTo(active + 1));

  useEffect(() => {
    remaining.current = interval;
  }, [active, interval]);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const timer = setTimeout(advance, Math.max(remaining.current, 0));
    return () => {
      clearTimeout(timer);
      remaining.current -= performance.now() - started;
    };
  }, [playing, active]);

  if (count === 0) return null;

  const controls =
    count > 1 ? (
      <Controls
        count={count}
        active={active}
        playing={playing}
        canAutoplay={canAutoplay}
        showPauseButton={showPauseButton}
        interval={interval}
        tone={tone}
        labelId={regionId}
        onGo={goTo}
        onToggle={() => setUserPaused((p) => !p)}
      />
    ) : null;

  // Touch swipe (mouse drags are ignored so text stays selectable)
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    pointer.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || count < 2) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(active + (dx < 0 ? 1 : -1));
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    if (e.key === "ArrowLeft") goTo(active - 1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={className}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div
        id={regionId}
        className={`grid touch-pan-y ${trackClassName}`}
        aria-live={playing ? "off" : "polite"}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointer.current = null)}
      >
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.id ?? index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`col-start-1 row-start-1 transition-[opacity,visibility] duration-700 ease-out-soft ${
                isActive ? "visible z-10 opacity-100" : "invisible z-0 opacity-0"
              }`}
            >
              {renderSlide(slide, {
                index,
                active: isActive,
                priority: index === 0,
                loadImages: loaded.has(index),
              })}
            </div>
          );
        })}
      </div>

      {renderControls ? renderControls(controls) : controls}
    </section>
  );
}
