import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollection, getCollectionProducts, getOrg } from "lib/flexi";
import { ProductGrid } from "components/product-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; collectionSlug: string }>;
}) {
  const { slug, collectionSlug } = await params;
  const collection = await getCollection(slug, collectionSlug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.description?.slice(0, 160),
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; collectionSlug: string }>;
}) {
  const { slug, collectionSlug } = await params;

  const [org, collection, products] = await Promise.all([
    getOrg(slug),
    getCollection(slug, collectionSlug),
    getCollectionProducts(slug, { collection: collectionSlug, limit: 48 }),
  ]);

  if (!collection || !org) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span>·</span>
        <Link href="/collections" className="hover:text-brand">
          Collections
        </Link>
        <span>·</span>
        <span className="text-neutral-900 truncate">{collection.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            {collection.description}
          </p>
        )}
        <p className="mt-3 text-sm text-neutral-500">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <ProductGrid
        products={products}
        currency={org.currency}
        emptyMessage="No products in this collection yet."
      />
    </div>
  );
}