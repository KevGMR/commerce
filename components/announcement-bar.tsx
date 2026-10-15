import Link from "next/link";

export type Announcement = {
  text: string;
  href?: string | null;
  isActive?: boolean;
};

export function AnnouncementBar({
  announcement,
}: {
  announcement?: Announcement | null;
}) {
  if (!announcement) return null;
  const text = announcement.text?.trim();
  if (!text) return null;
  if (announcement.isActive === false) return null;

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {text}
      {announcement.href && (
        <span aria-hidden="true" className="opacity-80">
          →
        </span>
      )}
    </span>
  );

  return (
    <div className="w-full bg-brand text-white">
      <div className="mx-auto flex h-8 max-w-6xl items-center justify-center px-4 text-[11px] font-medium uppercase tracking-[0.12em] sm:px-6">
        {announcement.href ? (
          <Link href={announcement.href} className="hover:opacity-90">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}