import type { Metadata } from "next";
import { getOrg } from "lib/flexi";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage({
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
        About {org.name}
      </h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700 sm:text-base">
        <p>
          {org.website.tagline ||
            `${org.name} is a Kenyan-owned business serving customers nationwide.`}
        </p>
        <p>
          <em>Placeholder — replace with your brand story.</em> Tell your
          customers who you are, why you started, and what makes you different.
          Authenticity matters more than polish here.
        </p>
        <p>
          <em>Placeholder — replace with your mission or values.</em> A short
          paragraph about what you stand for. One to three sentences is enough.
        </p>
      </div>

      <div className="mt-12 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-base font-semibold">Get in touch</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Questions? Visit our{" "}
          <a href="/contact" className="underline hover:text-brand">
            contact page
          </a>{" "}
          and we'll get back to you.
        </p>
      </div>
    </article>
  );
}