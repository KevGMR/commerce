import Image from "next/image";
import Link from "next/link";
import { getCollections } from "lib/flexi";

type Config = {
  heading?: string;
  subheading?: string;
  categorySlugs?: string[];
};

const MAX_CATEGORIES = 6;

export async function FeaturedCategorySection({
  config,
  slug,
}: {
  config: Config;
  slug: string;
}) {
  const selectedSlugs = Array.isArray(config.categorySlugs)
    ? config.categorySlugs.filter((s) => typeof s === "string" && s.length > 0)
    : [];

  if (selectedSlugs.length === 0) return null;

  const allCollections = await getCollections(slug);

  // Preserve the admin's chosen order; only include collections that exist.
  const byHandle = new Map(allCollections.map((c) => [c.handle, c]));
  const categories = selectedSlugs
    .map((s) => byHandle.get(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, MAX_CATEGORIES);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {(config.heading || config.subheading) && (
        <div className="mb-6">
          {config.heading && (
            <h2 className="text-2xl font-semibold tracking-tight">
              {config.heading}
            </h2>
          )}
          {config.subheading && (
            <p className="mt-1 text-sm text-neutral-500">
              {config.subheading}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((c) => {
          const imageUrl = c.image?.url;
          return (
            <Link
              key={c.id}
              href={`/collection/${c.handle}`}
              className="group relative block overflow-hidden rounded-lg bg-neutral-100"
            >
              <div className="relative aspect-[3/4]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={c.image?.altText || c.title}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-base font-medium tracking-tight">
                    {c.title}
                  </p>
                  {c.productCount > 0 && (
                    <p className="mt-0.5 text-xs text-white/75">
                      {c.productCount} item{c.productCount === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}