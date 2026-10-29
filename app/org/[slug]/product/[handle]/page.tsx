import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getProducts, getOrg } from "lib/flexi";
import { ProductDetailInteractive } from "components/product-detail-interactive";
import { ProductGrid } from "components/product-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; handle: string }>;
}) {
  const { slug, handle } = await params;
  const product = await getProduct(slug, handle);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; handle: string }>;
}) {
  const { slug, handle } = await params;

  const [org, product] = await Promise.all([
    getOrg(slug),
    getProduct(slug, handle),
  ]);

  if (!product || !org) notFound();

  const images =
    product.images.length > 0
      ? product.images
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  const related = (await getProducts(slug, { limit: 8 }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span>·</span>
        <Link href="/products" className="hover:text-brand">
          Shop
        </Link>
        <span>·</span>
        <span className="truncate text-neutral-900">{product.title}</span>
      </nav>

      <ProductDetailInteractive
        product={product}
        images={images}
        currency={org.currency}
      />

      {product.vendor || product.productType || product.tags.length > 0 ? (
        <dl className="mt-10 grid grid-cols-1 gap-2 border-t border-neutral-200 pt-6 text-sm">
          {product.vendor && <Row label="Vendor" value={product.vendor} />}
          {product.productType && (
            <Row label="Type" value={product.productType} />
          )}
          {product.tags.length > 0 && (
            <Row label="Tags" value={product.tags.join(", ")} />
          )}
        </dl>
      ) : null}

      {related.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">
            You might also like
          </h2>
          <ProductGrid products={related} currency={org.currency} />
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right text-neutral-900">{value}</span>
    </div>
  );
}