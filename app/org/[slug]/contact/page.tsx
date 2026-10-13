import type { Metadata } from "next";
import { getOrg } from "lib/flexi";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrg(slug);
  if (!org) return null;

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Contact us
      </h1>
      <p className="mt-4 text-sm text-neutral-600 sm:text-base">
        We're here to help. Reach out with any questions about your order,
        products, or shipping.
      </p>

      <div className="mt-10 space-y-8">
        <ContactBlock
          title="Customer support"
          lines={[
            "Email: support@example.com",
            "Phone: +254 700 000 000",
            "Mon–Fri, 9am–5pm EAT",
          ]}
          editable
        />
        <ContactBlock
          title="Order enquiries"
          lines={[
            "Have your order number ready.",
            "We aim to respond within 24 hours.",
          ]}
          editable
        />
        <ContactBlock
          title="Returns & exchanges"
          lines={[
            "See our returns policy first.",
            "Contact us to start a return.",
          ]}
          editable
        />
      </div>

      <p className="mt-12 text-xs text-neutral-500 italic">
        Placeholder contact details — replace with your real contact info
        before going live.
      </p>
    </article>
  );
}

function ContactBlock({
  title,
  lines,
  editable,
}: {
  title: string;
  lines: string[];
  editable?: boolean;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-2 space-y-1 text-sm text-neutral-600">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {editable && null}
    </div>
  );
}