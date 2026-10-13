import Link from "next/link";
import Image from "next/image";
import { getCollections } from "lib/flexi";

export const metadata = { title: "Collections" };

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collections = await getCollections(slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Collections
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {collections.length} collection{collections.length === 1 ? "" : "s"}
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
          No collections yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
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
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-300">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h2 className="font-medium">{c.title}</h2>
                {c.description && (
                  <p className="line-clamp-2 text-sm text-neutral-500">
                    {c.description}
                  </p>
                )}
                <p className="mt-auto pt-2 text-xs text-neutral-400">
                  {c.productCount} product{c.productCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}