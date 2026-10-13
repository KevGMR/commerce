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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPassthrough(pathname) || pathname.startsWith("/org/")) {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") || "";
  console.log(`[proxy] ${hostname} → ${pathname}${search}`);
  
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001")
    .split(":")[0];
  const cleanHost = hostname.split(":")[0].toLowerCase();

  let slug: string | null = null;

  if (cleanHost === rootDomain) {
    // Root domain, no tenant
    slug = null;
  } else if (cleanHost.endsWith(`.${rootDomain}`)) {
    const sub = cleanHost.slice(0, -(rootDomain.length + 1));
    if (sub && !sub.includes(".") && sub !== "www") slug = sub;
  } else {
    // Custom domain — pass through as-is; the layout will resolve via by-host
    slug = cleanHost;
  }

  if (!slug) {
    return NextResponse.rewrite(new URL("/no-org", request.url));
  }

  return NextResponse.rewrite(
    new URL(`/org/${encodeURIComponent(slug)}${pathname}${search}`, request.url),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};