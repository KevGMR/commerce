import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Returns & refunds
      </h1>
      <p className="mt-4 text-sm text-neutral-500">
        Our policy on returning items and getting your money back.
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-neutral-700 sm:text-base">
        <Section title="Return window">
          <p>
            <em>Placeholder.</em> You have 7 days from the date of delivery to
            return unused items in their original packaging. Items must be in
            resalable condition.
          </p>
        </Section>

        <Section title="What can be returned">
          <p>
            <em>Placeholder.</em> Most items can be returned. Exceptions
            include perishable goods, personal care items that have been
            opened, and items marked "final sale."
          </p>
        </Section>

        <Section title="How to start a return">
          <p>
            <em>Placeholder.</em> Contact our support team with your order
            number and reason for return. We'll arrange pickup or provide a
            return address.
          </p>
        </Section>

        <Section title="Refunds">
          <p>
            <em>Placeholder.</em> Once we receive and inspect your return, we
            process the refund within 3–5 business days. Refunds are issued to
            the original payment method (M-Pesa).
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}