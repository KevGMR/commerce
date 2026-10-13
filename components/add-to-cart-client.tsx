"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "lib/flexi/types";
import { useCart } from "components/cart/cart-context";
import { formatMoney } from "lib/flexi";

type Props = {
  product: Product;
  currency?: string;
};

export function AddToCartClient({ product, currency }: Props) {
  const { addCartItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id,
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  if (!selectedVariant) {
    return (
      <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
        This product has no variants available.
      </div>
    );
  }

  const handleAdd = () => {
    if (!selectedVariant.availableForSale) return;
    addCartItem(selectedVariant, product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="space-y-4">
      {product.variants.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Choose an option</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const disabled = !v.availableForSale;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  disabled={disabled}
                  className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-300 hover:border-neutral-500"
                  } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {v.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        {selectedVariant.availableForSale ? (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="text-green-700">In stock</span>
          </>
        ) : (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            <span className="text-red-600">Out of stock</span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedVariant.availableForSale}
        className="relative w-full rounded-full bg-brand py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {justAdded
          ? "✓ Added to cart"
          : `Add to cart · ${formatMoney(selectedVariant.price, currency)}`}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Secure checkout with M-Pesa
      </p>
    </div>
  );
}