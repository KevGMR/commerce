import { HeroSection } from "./hero";
import { FeaturedProductsSection } from "./featured-products";
import { CollectionSection } from "./collection";
import { RichTextSection } from "./rich-text";
import { TrustStripSection } from "./trust-strip";
import { BannerSection } from "./banner";
import { FeaturedCategorySection } from "./featured-category";
import { ImageTextSection } from "./image-text";
import { AnnouncementSection } from "./announcement";

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
    case "banner":
      return <BannerSection config={section.config} />;
    case "featured-category":
      return <FeaturedCategorySection config={section.config} slug={slug} />;
    case "image-text":
      return <ImageTextSection config={section.config} />;
    case "announcement":
      return <AnnouncementSection config={section.config} />;
    // "trust-strip" is intentionally not handled — use website.announcement
    // or the announcement section type instead.
    default:
      return null;
  }
}