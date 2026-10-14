import Image from "next/image";
import Link from "next/link";

type Config = {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  align?: "left" | "center";
};

export function HeroSection({ config }: { config: Config }) {
  const align = config.align === "center" ? "center" : "left";
  const hasImage = Boolean(config.imageUrl);

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900">
      {hasImage && (
        <>
          <Image
            src={config.imageUrl!}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
        </>
      )}

      <div
        className={`relative mx-auto flex w-full max-w-6xl flex-col px-4 py-20 sm:px-6 sm:py-28 ${
          align === "center" ? "items-center text-center" : "items-start"
        } ${hasImage ? "text-white" : ""}`}
      >
        {config.heading && (
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {config.heading}
          </h1>
        )}
        {config.subheading && (
          <p
            className={`mt-4 max-w-2xl text-base sm:text-lg ${
              hasImage ? "text-white/80" : "text-neutral-500"
            }`}
          >
            {config.subheading}
          </p>
        )}
        {config.ctaLabel && config.ctaHref && (
          <Link
            href={config.ctaHref}
            className="mt-8 inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            {config.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}