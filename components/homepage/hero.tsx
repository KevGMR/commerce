import Image from "next/image";
import Link from "next/link";

type Config = {
  heading?: string;
  subheading?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  align?: "left" | "center";
};

export function HeroSection({ config }: { config: Config }) {
  const align = config.align === "center" ? "center" : "left";
  const imageUrl = config.imageUrl?.trim();
  const hasImage = Boolean(imageUrl);

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900">
      {hasImage ? (
        <>
          <Image
            src={imageUrl!}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-brand" />
      )}

      <div className="relative mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col justify-end px-4 py-16 sm:min-h-[70vh] sm:px-6 sm:py-24">
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