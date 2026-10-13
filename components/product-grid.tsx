import type { Product } from "lib/flexi/types";
import { ProductCard } from "./product-card";

type Props = {
  products: Product[];
  currency?: string;
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  currency,
  emptyMessage = "No products available yet.",
}: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          currency={currency}
          priority={i < 4}
        />
      ))}
    </div>
  );
}