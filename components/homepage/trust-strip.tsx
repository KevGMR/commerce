type Item = { title?: string; body?: string };
type Config = { items?: Item[] };

export function TrustStripSection({ config }: { config: Config }) {
  const items = (config.items || []).filter((it) => it.title || it.body);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-3 sm:gap-8 sm:px-6">
        {items.map((it, i) => (
          <div key={i}>
            {it.title && (
              <h3 className="text-sm font-semibold">{it.title}</h3>
            )}
            {it.body && (
              <p className="mt-1 text-sm text-neutral-500">{it.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}