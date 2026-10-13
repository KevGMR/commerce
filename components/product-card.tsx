import Link from "next/link";
import Image from "next/image";
import type { Product } from "lib/flexi/types";
import { formatMoney } from "lib/flexi";

type Props = {
  product: Product;
  currency?: string;
  priority?: boolean;
};

export function ProductCard({ product, currency, priority = false }: Props) {
  const image = product.featuredImage;
  const inStock = product.availableForSale;
  const minPrice = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasRange = minPrice.amount !== maxPrice.amount;

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-neutral-100">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300 text-xs">
            No image
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
              Sold out
            </span>
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