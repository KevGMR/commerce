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

  const byHandle = new Map(allCollections.map((c) => [c.handle, c]));
  const categories = selectedSlugs
    .map((s) => byHandle.get(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, MAX_CATEGORIES);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-section sm:px-6">
      {(config.heading || config.subheading) && (
        <div className="mb-8">
          {config.subheading && (
            <p className="text-eyebrow uppercase text-neutral-500">
              {config.subheading}
            </p>
          )}
          {config.heading && (
            <h2 className="mt-2 text-h2 text-neutral-900">{config.heading}</h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {categories.map((c) => {
          const imageUrl = c.image?.url;
          return (
            <Link
              key={c.id}
              href={`/collection/${c.handle}`}
              className="group relative block overflow-hidden rounded-md bg-neutral-100"
            >
              <div className="relative aspect-[2/3]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={c.image?.altText || c.title}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <p className="text-base font-semibold tracking-tight sm:text-lg">
                    {c.title}
                  </p>
                  {c.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/75">
                      {c.description}
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