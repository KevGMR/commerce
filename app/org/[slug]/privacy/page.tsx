import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-neutral-500">
        Last updated: {new Date().toLocaleDateString("en-KE", {
          year: "numeric",
          month: "long",
        })}
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-neutral-700 sm:text-base">
        <Section title="What we collect">
          <p>
            <em>Placeholder.</em> We collect your name, phone number, and
            email address when you place an order. We also collect your
            delivery address if you request shipping.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>
            <em>Placeholder.</em> Your information is used to process orders,
            communicate about your purchase, and (with your consent) send you
            updates about new products.
          </p>
        </Section>

        <Section title="Payment data">
          <p>
            <em>Placeholder.</em> We do not store M-Pesa credentials or PINs.
            Payments are processed by Safaricom. We only see the transaction
            confirmation.
          </p>
        </Section>

        <Section title="Sharing your data">
          <p>
            <em>Placeholder.</em> We do not sell your data. We share
            information only with delivery partners and payment processors as
            needed to fulfil your order.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            <em>Placeholder.</em> You can request a copy of your data or ask
            us to delete it by contacting our support team.
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