import Image from "next/image";
import Link from "next/link";

type Config = {
  imageUrl?: string;
  href?: string;
  alt?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "left" | "center";
};

export function BannerSection({ config }: { config: Config }) {
  const imageUrl = config.imageUrl?.trim();
  if (!imageUrl) return null;

  const align = config.align === "center" ? "center" : "left";
  const hasText = Boolean(
    config.heading?.trim() || config.subheading?.trim() || (config.ctaLabel && config.ctaHref),
  );

  const card = (
    <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[16/6]">
      <Image
        src={imageUrl}
        alt={config.alt || ""}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />

      {hasText && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div
            className={`absolute inset-x-0 bottom-0 flex flex-col p-6 sm:p-10 lg:p-14 ${
              align === "center" ? "items-center text-center" : "items-start"
            }`}
          >
            {config.subheading && (
              <p className="mb-2 text-eyebrow uppercase text-white/75">
                {config.subheading}
              </p>
            )}
            {config.heading && (
              <h2 className="max-w-3xl text-h2 text-white sm:text-display">
                {config.heading}
              </h2>
            )}
            {config.ctaLabel && config.ctaHref && (
              <Link
                href={config.ctaHref}
                className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-white/90"
              >
                {config.ctaLabel}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );

  // If the banner has text, the whole card behaves as the CTA (via ctaHref)
  // or as a plain link (via href). If it has no text, fall back to a plain
  // image link (back-compat with image-only banners).
  const linkHref = config.ctaHref || config.href;

  return (
    <section className="w-full">
      {linkHref ? (
        <Link href={linkHref} className="group block">
          {card}
        </Link>
      ) : (
        <div className="group">{card}</div>
      )}
    </section>
  );
}