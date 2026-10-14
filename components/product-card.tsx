"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "lib/flexi/types";
import { formatMoney } from "lib/flexi";

type Props = {
  product: Product;
  currency?: string;
  priority?: boolean;
};

export function ProductCard({ product, currency, priority = false }: Props) {
  const [hovered, setHovered] = useState(false);

  const primary = product.featuredImage;
  const secondary = product.hoverImage;

  const showHover = hovered && Boolean(secondary);
  const hasSizes = product.sizes.length > 0;
  const inStock = product.availableForSale;

  const minPrice = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = minPrice.amount !== maxPrice.amount;

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {/* Primary image */}
        {primary?.url ? (
          <Image
            src={primary.url}
            alt={primary.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${
              showHover ? "opacity-0" : "opacity-100"
            }`}
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-300">
            No image
          </div>
        )}

        {/* Hover image */}
        {secondary && (
          <Image
            src={secondary}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${
              showHover ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Sold out overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
              Sold out
            </span>
          </div>
        )}

        {/* Sizes overlay — appears on hover when sizes exist and no
            bigger overlay is taking focus */}
        {hasSizes && inStock && (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-6 opacity-0 transition-all duration-300 ${
              hovered ? "translate-y-0 opacity-100" : ""
            }`}
          >
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded bg-white/95 px-2 py-0.5 text-[10px] font-medium text-neutral-900"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
          {product.title}
        </h3>
        <p className="mt-auto text-sm font-semibold text-neutral-900">
          {hasRange ? (
            <>
              {formatMoney(minPrice, currency)}
              <span className="text-neutral-400"> – </span>
              {formatMoney(maxPrice, currency)}
            </>
          ) : (
            formatMoney(minPrice, currency)
          )}
        </p>
      </div>
    </Link>
  );
}