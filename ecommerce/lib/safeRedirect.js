// The ?redirect= target after signing in, limited to paths on this site
export function getSafeRedirect(fallback = "/") {
  if (typeof window === "undefined") return fallback;
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect && /^\/(?![/\\])/.test(redirect) ? redirect : fallback;
}
