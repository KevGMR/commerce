import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;
const STOREFRONT_API_KEY = process.env.STOREFRONT_API_KEY;

export async function POST(request: Request) {
  if (!API_URL || !STOREFRONT_API_KEY) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 },
    );
  }

  const orgSlug = request.headers.get("x-org-slug");
  if (!orgSlug) {
    return NextResponse.json(
      { error: "Missing x-org-slug header" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const upstream = await fetch(`${API_URL}/storefront/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Storefront-Key": STOREFRONT_API_KEY,
      "X-Organization-Slug": orgSlug,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload, { status: upstream.status });
}