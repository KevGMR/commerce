import Link from "next/link";
import { getProducts, getProduct } from "lib/flexi";
import { ProductGrid } from "components/product-grid";
import type { Product } from "lib/flexi/types";

type Config = {
  heading?: string;
  subheading?: string;
  mode?: "latest" | "manual";
  productIds?: string[];
  limit?: number;
};

async function loadProducts(slug: string, config: Config): Promise<Product[]> {
  const limit = config.limit ?? 8;
  if (config.mode === "manual" && Array.isArray(config.productIds) && config.productIds.length > 0) {
    // Fetch each product by ID via the public products endpoint, then filter.
    // Simpler: use getProducts and filter by ID (page-level API doesn't have
    // a by-ids endpoint yet).
    const all = await getProducts(slug, { limit: 100 });
    const wanted = new Set(config.productIds);
    return all.filter((p) => wanted.has(p.id)).slice(0, limit);
  }
  return getProducts(slug, { limit });
}

export async function FeaturedProductsSection({
  config,
  slug,
  currency,
}: {
  config: Config;
  slug: string;
  currency: string;
}) {
  const products = await loadProducts(slug, config);

  if (products.length === 0 && !config.heading) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          {config.heading && (
            <h2 className="text-2xl font-semibold tracking-tight">
              {config.heading}
            </h2>
          )}
          {config.subheading && (
            <p className="mt-1 text-sm text-neutral-500">{config.subheading}</p>
          )}
        </div>
        <Link
          href="/products"
          className="hidden text-sm text-neutral-500 hover:text-brand sm:inline"
        >
          View all →
        </Link>
      </div>
      <ProductGrid products={products} currency={currency} />
    </section>
  );
}