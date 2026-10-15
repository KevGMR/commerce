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

  const priceNum = Number(minPrice.amount);
  const compareNum = product.compareAtPrice ?? null;
  const hasDiscount =
    compareNum != null && compareNum > priceNum && priceNum > 0;
  const discountPct = hasDiscount
    ? Math.round(((compareNum! - priceNum) / compareNum!) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-neutral-100">
        {primary?.url ? (
          <Image
            src={primary.url}
            alt={primary.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-all duration-700 ${
              showHover ? "scale-105 opacity-0" : "scale-100 opacity-100"
            }`}
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-300">
            No image
          </div>
        )}

        {secondary && (
          <Image
            src={secondary}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-all duration-700 ${
              showHover ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        )}

        {/* Discount badge — top-left */}
        {hasDiscount && inStock && (
          <div className="absolute left-2 top-2 z-10 rounded-sm bg-neutral-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            −{discountPct}%
          </div>
        )}

        {/* Sold out overlay */}
        {!inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
              Sold out
            </span>
          </div>
        )}

        {/* Sizes overlay on hover */}
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

      <div className="mt-3 flex flex-col gap-1">
        {product.vendor && (
          <p className="text-eyebrow uppercase text-neutral-500">
            {product.vendor}
          </p>
        )}
        <h3 className="line-clamp-2 text-label font-medium leading-snug text-neutral-900">
          {product.title}
        </h3>
        <p className="mt-0.5 text-label text-neutral-900">
          {hasDiscount && (
            <span className="mr-2 text-neutral-400 line-through">
              {formatMoney(
                { amount: compareNum!.toFixed(2), currencyCode: minPrice.currencyCode },
                currency,
              )}
            </span>
          )}
          {hasRange ? (
            <>
              {formatMoney(minPrice, currency)}
              <span className="text-neutral-400"> – </span>
              {formatMoney(maxPrice, currency)}
            </>
          ) : (
            <span className={hasDiscount ? "font-semibold" : ""}>
              {formatMoney(minPrice, currency)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}