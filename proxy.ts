import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSTHROUGH = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPassthrough(pathname: string) {
  return PASSTHROUGH.some((p) => pathname.startsWith(p));
}

/**
 * Ask the API which org owns a given host. Used for custom domains
 * (e.g. houseofqueens.shop), where there's no subdomain to extract.
 * Returns the org slug or null. Never throws — returns null on any error.
 */
async function resolveSlugByHost(host: string): Promise<string | null> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(
      `${apiUrl}/storefront/orgs/by-host?host=${encodeURIComponent(host)}`,
      {
        // Don't cache negative results; short TTL for positives.
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { slug?: string };
    return data?.slug || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPassthrough(pathname) || pathname.startsWith("/org/")) {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") || "";
  const rootDomain =
    (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001")
      .split(":")[0] || "localhost";
  const cleanHost = (hostname.split(":")[0] || "").toLowerCase();

  let slug: string | null = null;

  if (cleanHost === rootDomain || cleanHost === `www.${rootDomain}`) {
    // Root domain, no tenant
    slug = null;
  } else if (cleanHost.endsWith(`.${rootDomain}`)) {
    // Subdomain routing
    const sub = cleanHost.slice(0, -(rootDomain.length + 1));
    if (sub && !sub.includes(".") && sub !== "www") slug = sub;
  } else {
    // Custom domain — resolve via API
    slug = await resolveSlugByHost(cleanHost);
  }

  if (!slug) {
    return NextResponse.rewrite(new URL("/no-org", request.url));
  }

  return NextResponse.rewrite(
    new URL(
      `/org/${encodeURIComponent(slug)}${pathname}${search}`,
      request.url,
    ),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};