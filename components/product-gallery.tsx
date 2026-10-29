"use client";

import Image from "next/image";
import { useState } from "react";
import type { Image as FlexiImage } from "lib/flexi/types";

type Props = {
  images: FlexiImage[];
  title: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
};

export function ProductGallery({
  images,
  title,
  activeIndex,
  onActiveIndexChange,
}: Props) {
  const [internalIndex, setInternalIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-neutral-100" />
    );
  }

  // Controlled if activeIndex provided, else uncontrolled (for safety).
  const index =
    typeof activeIndex === "number"
      ? Math.max(0, Math.min(activeIndex, images.length - 1))
      : internalIndex;
  const active = images[index];

  const setIndex = (next: number) => {
    if (onActiveIndexChange) {
      onActiveIndexChange(next);
    } else {
      setInternalIndex(next);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={active.url}
          alt={active.altText || title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                i === index
                  ? "border-neutral-900"
                  : "border-transparent hover:border-neutral-300"
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} image ${i + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}