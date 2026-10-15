import Link from "next/link";

type Config = {
  text?: string;
  href?: string;
  tone?: "brand" | "ink" | "muted";
};

export function AnnouncementSection({ config }: { config: Config }) {
  const text = config.text?.trim();
  if (!text) return null;

  const tone = config.tone || "brand";
  const toneClasses =
    tone === "ink"
      ? "bg-neutral-900 text-white"
      : tone === "muted"
        ? "bg-neutral-100 text-neutral-900"
        : "bg-brand text-white";

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {text}
      {config.href && (
        <span aria-hidden="true" className="opacity-80">
          →
        </span>
      )}
    </span>
  );

  return (
    <div className={`w-full ${toneClasses}`}>
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center px-4 text-[11px] font-medium uppercase tracking-[0.12em] sm:px-6">
        {config.href ? (
          <Link href={config.href} className="hover:opacity-90">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}