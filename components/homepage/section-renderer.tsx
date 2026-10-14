import { HeroSection } from "./hero";
import { FeaturedProductsSection } from "./featured-products";
import { CollectionSection } from "./collection";
import { RichTextSection } from "./rich-text";
import { TrustStripSection } from "./trust-strip";
import { BannerSection } from "./banner";

type Section = {
  id: string;
  type: string;
  config: Record<string, any>;
};

export async function HomepageSection({
  section,
  slug,
  currency,
}: {
  section: Section;
  slug: string;
  currency: string;
}) {
  switch (section.type) {
    case "hero":
      return <HeroSection config={section.config} />;
    case "featured-products":
      return (
        <FeaturedProductsSection
          config={section.config}
          slug={slug}
          currency={currency}
        />
      );
    case "collection":
      return (
        <CollectionSection
          config={section.config}
          slug={slug}
          currency={currency}
        />
      );
    case "rich-text":
      return <RichTextSection config={section.config} />;
    case "trust-strip":
      return <TrustStripSection config={section.config} />;
    case "banner":
      return <BannerSection config={section.config} />;
    default:
      return null;
  }
}