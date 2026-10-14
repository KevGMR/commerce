import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001"}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/cart"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}