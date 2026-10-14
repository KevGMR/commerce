import Image from "next/image";
import Link from "next/link";

type Config = {
  imageUrl?: string;
  href?: string;
  alt?: string;
};

export function BannerSection({ config }: { config: Config }) {
  if (!config.imageUrl) return null;

  const inner = (
    <div className="relative aspect-[16/6] w-full overflow-hidden rounded-lg bg-neutral-100">
      <Image
        src={config.imageUrl}
        alt={config.alt || ""}
        fill
        sizes="(min-width: 1024px) 1152px, 100vw"
        className="object-cover"
      />
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {config.href ? (
        <Link href={config.href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </section>
  );
}