import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CartProvider } from "components/cart/cart-context";
import { Header } from "components/layout/header";
import { Footer } from "components/layout/footer";
import { getOrg } from "lib/flexi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrg(slug);
  if (!org) return { title: "Store not found" };
  return {
    title: {
      default: org.name,
      template: `%s · ${org.name}`,
    },
    description: org.website.tagline || `Shop online at ${org.name}`,
  };
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrg(slug);

  if (!org) {
    notFound();
  }

  const brandVars = {
    "--color-brand": org.website.primaryColor,
    "--color-accent": org.website.accentColor,
  } as React.CSSProperties;

  return (
    <CartProvider>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{${Object.entries(brandVars)
            .map(([k, v]) => `${k}:${v}`)
            .join(";")}}`,
        }}
      />
      <div
        style={brandVars}
        className="flex min-h-screen flex-col bg-white text-neutral-900"
      >
        <Header
          orgName={org.name}
          slug={slug}
          logoUrl={org.website.logoUrl}
          layout={org.website.headerLayout}
        />
        <main className="flex-1">
          {children}
        </main>
        <Footer
          orgName={org.name}
          tagline={org.website.tagline}
          slug={slug}
          currency={org.currency}
        />
      </div>
    </CartProvider>
  );
}