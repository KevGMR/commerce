import Link from "next/link";
import { getCollection, getCollectionProducts } from "lib/flexi";
import { ProductGrid } from "components/product-grid";

type Config = {
  heading?: string;
  subheading?: string;
  collectionSlug?: string;
  limit?: number;
};

export async function CollectionSection({
  config,
  slug,
  currency,
}: {
  config: Config;
  slug: string;
  currency: string;
}) {
  if (!config.collectionSlug) return null;

  const [collection, products] = await Promise.all([
    getCollection(slug, config.collectionSlug),
    getCollectionProducts(slug, {
      collection: config.collectionSlug,
      limit: config.limit ?? 8,
    }),
  ]);

  if (!collection) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {config.heading || collection.title}
          </h2>
          {config.subheading && (
            <p className="mt-1 text-sm text-neutral-500">{config.subheading}</p>
          )}
        </div>
        <Link
          href={`/collection/${collection.handle}`}
          className="hidden text-sm text-neutral-500 hover:text-brand sm:inline"
        >
          View collection →
        </Link>
      </div>
      <ProductGrid products={products} currency={currency} />
    </section>
  );
}