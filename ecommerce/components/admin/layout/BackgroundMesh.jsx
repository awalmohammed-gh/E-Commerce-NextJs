/*
  Quiet, fixed backdrop for the admin: three large, heavily blurred
  blobs (warm sand, muted terracotta, a hint of dusty blue) over the
  canvas colour. Static - nothing moves. Sits behind everything inside
  the .admin wrapper, which is `isolate` so the negative z-index stays
  above its background.
*/
export default function BackgroundMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-[20%] -left-[10%] h-[60vmax] w-[60vmax] rounded-full bg-[#e9dcc8] opacity-70 blur-[120px]" />
      <div className="absolute -right-[15%] -bottom-[25%] h-[55vmax] w-[55vmax] rounded-full bg-terracotta opacity-[0.14] blur-[140px]" />
      <div className="absolute -top-[15%] right-[5%] h-[40vmax] w-[40vmax] rounded-full bg-[#cfd9e4] opacity-45 blur-[120px]" />
    </div>
  );
}
