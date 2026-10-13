"use client";

import Image from "next/image";
import { useState } from "react";
import type { Image as FlexiImage } from "lib/flexi/types";

type Props = {
  images: FlexiImage[];
  title: string;
};

export function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <div className="flex h-full items-center justify-center text-neutral-300 text-sm">
          No image
        </div>
      </div>
    );
  }

  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={current.url}
          alt={current.altText || title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                i === active
                  ? "border-brand"
                  : "border-transparent hover:border-neutral-300"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} ${i + 1}`}
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