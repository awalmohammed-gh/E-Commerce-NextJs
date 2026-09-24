"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

/*
  Product photo from MongoDB/Cloudinary with a neutral fallback when the
  product has no image or the URL fails to load.
*/
export default function ProductImage({ src, alt, className = "", ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-sand text-taupe/60"
        role="img"
        aria-label={alt ? `${alt} (no image)` : "No image available"}
      >
        <ImageOff className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-wider">No image</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
