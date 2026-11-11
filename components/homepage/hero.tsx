import Image from "next/image";
import Link from "next/link";

type Config = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  imageUrlMobile?: string;
  align?: "left" | "center";
  fullHeight?: boolean;
};

export function HeroSection({ config }: { config: Config }) {
  const align = config.align === "center" ? "center" : "left";
  const imageUrl = config.imageUrl?.trim();
  const imageUrlMobile = config.imageUrlMobile?.trim();
  const hasImage = Boolean(imageUrl || imageUrlMobile);
  const hasDistinctMobileImage = Boolean(
    imageUrlMobile && imageUrlMobile !== imageUrl,
  );
  const heightClass = config.fullHeight
    ? "min-h-screen sm:min-h-[85vh]"
    : "min-h-[60vh] sm:min-h-[70vh]";

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900">
      {hasImage ? (
        <>
          {hasDistinctMobileImage ? (
            <picture>
              <source media="(max-width: 640px)" srcSet={imageUrlMobile!} />
              <Image
                src={imageUrl || imageUrlMobile!}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </picture>
          ) : (
            <Image
              src={(imageUrl || imageUrlMobile)!}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-brand" />
      )}

      <div
        className={`relative mx-auto flex ${heightClass} w-full max-w-6xl flex-col justify-end px-4 py-16 sm:px-6 sm:py-24`}
      >
        <div
          className={`max-w-2xl ${
            align === "center" ? "mx-auto items-center text-center" : ""
          }`}
        >
          {config.eyebrow && (
            <p className="mb-3 text-eyebrow uppercase text-white/70">
              {config.eyebrow}
            </p>
          )}
          {config.heading && (
            <h1 className="text-display text-white">{config.heading}</h1>
          )}
          {config.subheading && (
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              {config.subheading}
            </p>
          )}
          {config.ctaLabel && config.ctaHref && (
            <Link
              href={config.ctaHref}
              className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-white/90"
            >
              {config.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}