import Link from "next/link";
import Image from "next/image";
import { getOrg, getProducts, getCollections } from "lib/flexi";
import { ProductGrid } from "components/product-grid";
import { HomepageSection } from "components/homepage/section-renderer";

export default async function OrgHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [org, products, collections] = await Promise.all([
    getOrg(slug),
    getProducts(slug, { limit: 8 }),
    getCollections(slug),
  ]);

  console.log("[OrgHome]", {
    slug,
    hasOrg: !!org,
    sectionCount: org?.website?.homepageSections?.length,
    sections: org?.website?.homepageSections,
  });

  console.log("[OrgHome] website:", JSON.stringify(org.website, null, 2));

  if (!org) return null;

  const sections = org.website.homepageSections || [];
  const currency = org.currency;

  // If the org has built a homepage, render that.
  if (sections.length > 0) {
    return (
      <div className="flex flex-col">
        {sections.map((section) => (
          <HomepageSection
            key={section.id}
            section={section}
            slug={slug}
            currency={currency}
          />
        ))}
      </div>
    );
  }

  // Fallback: the original hardcoded homepage for orgs without sections.
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {org.website.tagline || `Shop ${org.name}`}
          </h1>
          <p className="mt-4 text-base text-neutral-500 sm:text-lg">
            Browse our latest products and check out securely with M-Pesa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Shop all products
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Browse collections
            </Link>
          </div>
        </div>
      </section>

      {collections.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Shop by collection
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Curated picks for every need
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden text-sm text-neutral-500 hover:text-brand sm:inline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {collections.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/collection/${c.handle}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video bg-neutral-100">
                  {c.image?.url ? (
                    <Image
                      src={c.image.url}
                      alt={c.image.altText || c.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-300">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="font-medium">{c.title}</h3>
                  {c.description && (
                    <p className="line-clamp-2 text-sm text-neutral-500">
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Featured products
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Popular items customers love
              </p>
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
      )}

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-3 sm:gap-8 sm:px-6">
          <TrustItem
            title="Fast delivery"
            body="Nationwide shipping, dispatched within 24 hours."
          />
          <TrustItem
            title="Secure checkout"
            body="Pay with M-Pesa. Your details are never stored."
          />
          <TrustItem
            title="Easy returns"
            body="7-day returns on unused items. See returns page."
          />
        </div>
      </section>
    </div>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{body}</p>
    </div>
  );
}