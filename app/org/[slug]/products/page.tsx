import { getProducts, getOrg } from "lib/flexi";
import { ProductGrid } from "components/product-grid";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Shop" };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;

  const [org, products] = await Promise.all([
    getOrg(slug),
    getProducts(slug, { query: q, limit: 48 }),
  ]);

  if (!org) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {q ? `Results for "${q}"` : "Shop all"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {products.length} product{products.length === 1 ? "" : "s"}
          {q && (
            <>
              {" · "}
              <a href="/products" className="underline hover:text-brand">
                Clear search
              </a>
            </>
          )}
        </p>
      </div>

      <ProductGrid
        products={products}
        currency={org.currency}
        emptyMessage={
          q
            ? `No products match "${q}". Try a different search.`
            : "No products available yet."
        }
      />
    </div>
  );
}