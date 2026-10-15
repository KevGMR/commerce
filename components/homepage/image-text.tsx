import Image from "next/image";
import Link from "next/link";

type Config = {
  heading?: string;
  subheading?: string;
  body?: string;
  imageUrl?: string;
  imageUrlMobile?: string;
  imagePosition?: "left" | "right";
  ctaLabel?: string;
  ctaHref?: string;
};

export function ImageTextSection({ config }: { config: Config }) {
  const heading = config.heading?.trim();
  const subheading = config.subheading?.trim();
  const body = config.body?.trim();
  const imageUrl = config.imageUrl?.trim();
  const imageUrlMobile = config.imageUrlMobile?.trim() || imageUrl;
  const imagePosition = config.imagePosition === "right" ? "right" : "left";
  const ctaLabel = config.ctaLabel?.trim();
  const ctaHref = config.ctaHref?.trim();

  if (!heading && !subheading && !body && !imageUrl) return null;

  const hasText = Boolean(
    heading || subheading || body || (ctaLabel && ctaHref),
  );
  const imageFirst = imagePosition === "left";

  const text = (
    <div className="flex flex-col justify-center">
      {heading && (
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {heading}
        </h2>
      )}
      {subheading && (
        <p className="mt-2 text-sm font-medium uppercase tracking-wide text-neutral-500">
          {subheading}
        </p>
      )}
      {body && (
        <p className="mt-4 max-w-prose whitespace-pre-line text-base text-neutral-600">
          {body}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-8 inline-flex w-fit items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );

  // No image — render text block only.
  if (!imageUrl) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">{text}</div>
      </section>
    );
  }

  // From here TypeScript knows `imageUrl` is a non-empty string.
  const desktopImageUrl: string = imageUrl;
  const mobileImageUrl: string | undefined =
    imageUrlMobile && imageUrlMobile !== imageUrl ? imageUrlMobile : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div
        className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 ${
          hasText ? "" : "md:grid-cols-1"
        }`}
      >
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 ${
            imageFirst ? "md:order-1" : "md:order-2"
          }`}
        >
          {mobileImageUrl ? (
            <>
              <Image
                src={mobileImageUrl}
                alt={heading || ""}
                fill
                sizes="(min-width: 768px) 0px, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src={desktopImageUrl}
                alt={heading || ""}
                fill
                sizes="(min-width: 768px) 50vw, 0px"
                className="hidden object-cover md:block"
              />
            </>
          ) : (
            <Image
              src={desktopImageUrl}
              alt={heading || ""}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        {hasText && (
          <div className={imageFirst ? "md:order-2" : "md:order-1"}>
            {text}
          </div>
        )}
      </div>
    </section>
  );
}