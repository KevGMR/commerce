"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Product, ProductVariant } from "lib/flexi/types";
import { useCart } from "components/cart/cart-context";
import { useState } from "react";

export function AddToCart({
  product,
  variant,
  availableForSale,
  className,
}: {
  product: Product;
  variant: ProductVariant;
  availableForSale: boolean;
  className?: string;
}) {
  const { addCartItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    if (!availableForSale) return;
    addCartItem(variant, product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  if (!availableForSale) {
    return (
      <button
        disabled
        className={clsx(
          "rounded-full bg-neutral-200 p-4 text-neutral-500",
          className,
        )}
        aria-label="Out of stock"
      >
        <PlusIcon className="h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Add to cart"
      className={clsx(
        "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white transition-opacity hover:opacity-90",
        className,
      )}
    >
      <PlusIcon className="h-5" />
      {justAdded && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-green-600 text-xs font-medium">
          Added
        </span>
      )}
    </button>
  );
}