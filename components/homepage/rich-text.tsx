type Config = {
  heading?: string;
  body?: string;
};

export function RichTextSection({ config }: { config: Config }) {
  if (!config.heading && !config.body) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {config.heading && (
        <h2 className="text-2xl font-semibold tracking-tight">
          {config.heading}
        </h2>
      )}
      {config.body && (
        <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-neutral-600">
          {config.body}
        </div>
      )}
    </section>
  );
}