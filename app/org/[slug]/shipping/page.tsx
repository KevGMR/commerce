import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Shipping
      </h1>
      <p className="mt-4 text-sm text-neutral-500">
        Everything you need to know about how we deliver your order.
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-neutral-700 sm:text-base">
        <Section title="Delivery times">
          <p>
            <em>Placeholder.</em> Orders placed before 2pm EAT are dispatched
            the same day. Deliveries within Nairobi typically arrive within
            24 hours. Upcountry deliveries take 2–5 business days.
          </p>
        </Section>

        <Section title="Shipping costs">
          <p>
            <em>Placeholder.</em> Shipping is calculated at checkout based on
            your location and the size of your order. Free shipping on orders
            over KES 5,000.
          </p>
        </Section>

        <Section title="Tracking your order">
          <p>
            <em>Placeholder.</em> Once your order ships, you'll receive an SMS
            with a tracking number. You can use it to follow your delivery on
            our courier partner's site.
          </p>
        </Section>

        <Section title="Delivery areas">
          <p>
            <em>Placeholder.</em> We currently deliver to all major towns in
            Kenya. If you're outside our delivery area, contact us and we'll
            find a solution.
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