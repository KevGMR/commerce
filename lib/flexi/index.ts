import { flexiFetch } from "./client";
import type {
  Collection,
  Image,
  Money,
  Product,
  ProductVariant,
} from "./types";

// ---------------------------------------------------------------------------
// Reshapers — translate API responses to the shapes components expect
// ---------------------------------------------------------------------------

type ApiProduct = {
  id: string;
  name: string;
  handle: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string }[];
  defaultImage: string | null;
  variants: {
    id: string;
    sku: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    available: number | null;
    image: string | null;
  }[];
  options: { name: string; position: number; values: string[] }[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  hoverImage?: string | null;
  sizes?: string[];
};

function money(amount: number, currency: string = "KES"): Money {
  return { amount: amount.toFixed(2), currencyCode: currency };
}

function reshapeImage(raw: { url: string; alt?: string }): Image {
  return { url: raw.url, altText: raw.alt || "" };
}

function reshapeVariant(raw: ApiProduct["variants"][number]): ProductVariant {
  return {
    id: raw.id,
    sku: raw.sku,
    title: raw.title || "Default",
    price: money(raw.price),
    compareAtPrice:
      raw.compareAtPrice != null ? money(raw.compareAtPrice) : null,
    availableForSale: raw.available === null || raw.available > 0,
    selectedOptions: raw.title ? [{ name: "Option", value: raw.title }] : [],
  };
}

function reshapeProduct(raw: ApiProduct): Product {
  const prices = raw.variants.map((v) => v.price).filter(Number.isFinite);
  const minPrice = prices.length ? Math.min(...prices) : raw.price ?? 0;
  const maxPrice = prices.length ? Math.max(...prices) : raw.price ?? 0;

  const featured = raw.defaultImage
    ? { url: raw.defaultImage, altText: "" }
    : null;

  const variants = raw.variants.map(reshapeVariant);

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.name,
    description: raw.description,
    availableForSale: variants.some((v) => v.availableForSale),
    productType: raw.productType || "",
    vendor: raw.vendor || "",
    tags: raw.tags || [],
    options: (raw.options || []).map((o, idx) => ({
      id: `opt-${idx}`,
      name: o.name,
      values: o.values || [],
    })),
    priceRange: {
      minVariantPrice: money(minPrice),
      maxVariantPrice: money(maxPrice),
    },
    featuredImage: featured,
    images: (raw.images || []).map(reshapeImage),
    variants,
    seo: {
      title: raw.seoTitle || raw.name,
      description:
        raw.seoDescription || raw.description?.slice(0, 160) || "",
    },
    updatedAt: raw.publishedAt || new Date().toISOString(),
    hoverImage: raw.hoverImage || null,
    sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
    compareAtPrice: typeof raw.compareAtPrice === "number" ? raw.compareAtPrice : null,
  };
}

type ApiCollection = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; alt?: string } | null;
  productCount?: number;
};

function reshapeCollection(raw: ApiCollection): Collection {
  return {
    id: raw._id,
    handle: raw.slug,
    title: raw.name,
    description: raw.description || "",
    image: raw.image ? reshapeImage(raw.image) : null,
    path: `/collections/${raw.slug}`,
    productCount: raw.productCount ?? 0,
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Products (server components — pass orgSlug from route params)
// ---------------------------------------------------------------------------

export async function getProducts(
  orgSlug: string,
  opts: { query?: string; limit?: number; skip?: number } = {},
): Promise<Product[]> {
  const res = await flexiFetch<{ products: ApiProduct[] }>(
    "/storefront/products",
    {
      orgSlug,
      searchParams: {
        search: opts.query,
        limit: opts.limit ?? 24,
        skip: opts.skip ?? 0,
      },
      revalidate: 60,
      tags: ["products"],
    },
  );
  return (res.products || []).map(reshapeProduct);
}

export async function getProduct(
  orgSlug: string,
  handle: string,
): Promise<Product | null> {
  try {
    const res = await flexiFetch<{ product: ApiProduct }>(
      `/storefront/products/${encodeURIComponent(handle)}`,
      {
        orgSlug,
        revalidate: 60,
        tags: ["products", `product-${handle}`],
      },
    );
    return reshapeProduct(res.product);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function getCollections(orgSlug: string): Promise<Collection[]> {
  const res = await flexiFetch<{ collections: ApiCollection[] }>(
    "/storefront/collections",
    { orgSlug, revalidate: 300, tags: ["collections"] },
  );
  return (res.collections || []).map(reshapeCollection);
}

export async function getCollection(
  orgSlug: string,
  handle: string,
): Promise<Collection | null> {
  try {
    const res = await flexiFetch<{ collection: ApiCollection }>(
      `/storefront/collections/${encodeURIComponent(handle)}`,
      {
        orgSlug,
        revalidate: 300,
        tags: ["collections", `collection-${handle}`],
      },
    );
    return reshapeCollection(res.collection);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function getCollectionProducts(
  orgSlug: string,
  opts: { collection: string; limit?: number; skip?: number },
): Promise<Product[]> {
  const res = await flexiFetch<{ products: ApiProduct[] }>(
    `/storefront/collections/${encodeURIComponent(opts.collection)}`,
    {
      orgSlug,
      searchParams: {
        limit: opts.limit ?? 24,
        skip: opts.skip ?? 0,
      },
      revalidate: 300,
      tags: ["collections", "products"],
    },
  );
  return (res.products || []).map(reshapeProduct);
}

// ---------------------------------------------------------------------------
// Org
// ---------------------------------------------------------------------------

export type Org = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  settings?: {
    currency?: string;
    language?: string;
    timezone?: string;
  };
  website: {
    logoUrl: string | null;
    faviconUrl: string | null;
    tagline: string | null;
    primaryColor: string;
    accentColor: string;
    headerLayout: "centered" | "left";
    published: boolean;
    homepageSections: Array<{
      id: string;
      type: string;
      config: Record<string, any>;
    }>;
    announcement: {
      text: string;
      href?: string | null;
      isActive?: boolean;
    } | null;
  };
  location: {
    id: string;
    name: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    } | null;
  } | null;
  deliveryCategories: import("./types").DeliveryCategory[];
};

type ApiOrgResponse = {
  organization: {
    id: string;
    name: string;
    slug: string;
    settings?: {
      currency?: string;
      language?: string;
      timezone?: string;
    };
    website?: {
      logoUrl?: string | null;
      faviconUrl?: string | null;
      tagline?: string | null;
      primaryColor?: string;
      accentColor?: string;
      headerLayout?: "centered" | "left";
      published?: boolean;
      homepage?: {
        sections?: Array<{
          id: string;
          type: string;
          config: Record<string, any>;
        }>;
      };
      announcement?: {
        text?: string | null;
        href?: string | null;
        isActive?: boolean;
      } | null;
    };
    location?: {
      id: string;
      name: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      } | null;
    } | null;
    deliveryCategories?: Array<{
      id: string;
      categoryName: string;
      description?: string | null;
      options: Array<{
        id: string;
        optionName: string;
        price: number;
        estimatedDays?: number | null;
        description?: string | null;
        requiresAddress?: boolean;
        requiresLandmark?: boolean;
      }>;
    }>;
  };
};

export async function getOrg(orgSlug: string): Promise<Org | null> {
  try {
    const res = await flexiFetch<ApiOrgResponse>("/storefront/org", {
      orgSlug,
      revalidate: 30,
      tags: [`org-${orgSlug}`],
    });

    const o = res.organization;
    const currency = o.settings?.currency || "KES";

    console.log("[getOrg] raw website:", JSON.stringify(o.website, null, 2));

    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      currency,
      settings: o.settings,
      website: {
        logoUrl: o.website?.logoUrl ?? null,
        faviconUrl: o.website?.faviconUrl ?? null,
        tagline: o.website?.tagline ?? null,
        primaryColor: o.website?.primaryColor || "#111111",
        accentColor: o.website?.accentColor || "#2563eb",
        headerLayout:
          o.website?.headerLayout === "centered" ? "centered" : "left",
        published: o.website?.published === true,
        homepageSections: Array.isArray(o.website?.homepage?.sections)
          ? o.website.homepage.sections.map((s) => ({
              id: s.id,
              type: s.type,
              config: s.config || {},
            }))
          : [],
        announcement: o.website?.announcement?.text
          ? {
              text: o.website.announcement.text,
              href: o.website.announcement.href ?? null,
              isActive: o.website.announcement.isActive !== false,
            }
          : null,
      },
      location: o.location
        ? {
            id: o.location.id,
            name: o.location.name,
            address: o.location.address || null,
          }
        : null,
      deliveryCategories: Array.isArray(o.deliveryCategories)
        ? o.deliveryCategories.map((c) => ({
            id: String(c.id),
            categoryName: c.categoryName,
            description: c.description ?? null,
            options: (c.options || []).map((opt) => ({
              id: String(opt.id),
              optionName: opt.optionName,
              price: Number(opt.price) || 0,
              estimatedDays: opt.estimatedDays ?? null,
              description: opt.description ?? null,
              requiresAddress: opt.requiresAddress !== false,
              requiresLandmark: opt.requiresLandmark === true,
            })),
          }))
        : [],
    };
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Legacy cart stubs — cart is client-side (components/cart/cart-context.tsx)
// ---------------------------------------------------------------------------

export async function createCart() {
  throw new Error(
    "Cart is client-side only. Use useCart() from cart-context.",
  );
}
export async function addToCart() {
  throw new Error(
    "Cart is client-side only. Use useCart() from cart-context.",
  );
}
export async function removeFromCart() {
  throw new Error(
    "Cart is client-side only. Use useCart() from cart-context.",
  );
}
export async function updateCart() {
  throw new Error(
    "Cart is client-side only. Use useCart() from cart-context.",
  );
}
export async function getCart() {
  return undefined;
}

// ---------------------------------------------------------------------------
// Menu — stubbed until we add an endpoint
// ---------------------------------------------------------------------------

export async function getMenu(_handle: string) {
  return [] as { title: string; path: string }[];
}

// ---------------------------------------------------------------------------
// Checkout + order status — client-safe
//
// Called from browser components. Route through our own Next.js API routes
// (/api/...) which attach the storefront key server-side. The key never
// reaches the browser.
// ---------------------------------------------------------------------------

export type CheckoutPayload = {
  items: { variantId: string; quantity: number }[];
  customer: { name: string; phone: string; email?: string };
  delivery: {
    categoryName: string;
    optionName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      landmark?: string;
    };
    notes?: string;
  };
  notes?: string;
};

export type CheckoutResponse = {
  success: true;
  order: {
    saleId: string;
    receiptNumber: string;
    totalAmount: number;
    paymentStatus: string;
  };
  mpesa: {
    checkoutRequestId: string;
    customerMessage: string;
  };
};

export async function checkout(
  orgSlug: string,
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-slug": orgSlug,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err: any = new Error(
      data?.error || `Checkout failed: ${res.status}`,
    );
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }

  return data as CheckoutResponse;
}

export type OrderStatus = {
  order: {
    saleId: string;
    receiptNumber: string;
    totalAmount: number;
    paymentStatus: "pending" | "completed" | "failed" | "partial";
    status: string;
    createdAt: string;
    mpesaReceiptNumber: string | null;
  };
};

export async function getOrderStatus(
  orgSlug: string,
  saleId: string,
): Promise<OrderStatus> {
  const res = await fetch(
    `/api/orders/${encodeURIComponent(saleId)}/status`,
    {
      headers: { "x-org-slug": orgSlug },
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err: any = new Error(
      data?.error || `Status check failed: ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }

  return data as OrderStatus;
}

/**
 * Client-safe org fetch. Routes through /api/org (Next.js) which attaches
 * the storefront key server-side. Use from client components only —
 * server components should use getOrg() directly.
 */
export async function getOrgClient(orgSlug: string): Promise<Org | null> {
  try {
    const res = await fetch("/api/org", {
      headers: { "x-org-slug": orgSlug },
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json();
    const o = data?.organization;
    if (!o) return null;

    const currency = o.settings?.currency || "KES";

    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      currency,
      settings: o.settings,
      website: {
        logoUrl: o.website?.logoUrl ?? null,
        faviconUrl: o.website?.faviconUrl ?? null,
        tagline: o.website?.tagline ?? null,
        primaryColor: o.website?.primaryColor || "#111111",
        accentColor: o.website?.accentColor || "#2563eb",
        headerLayout:
          o.website?.headerLayout === "centered" ? "centered" : "left",
        published: o.website?.published === true,
        homepageSections: Array.isArray(o.website?.homepage?.sections)
        ? o.website.homepage.sections.map((s: any) => ({
            id: s.id,
            type: s.type,
            config: s.config || {},
          }))
        : [],
        announcement: o.website?.announcement?.text
          ? {
              text: o.website.announcement.text,
              href: o.website.announcement.href ?? null,
              isActive: o.website.announcement.isActive !== false,
            }
          : null,
      },
      location: o.location
        ? {
            id: o.location.id,
            name: o.location.name,
            address: o.location.address || null,
          }
        : null,
      deliveryCategories: Array.isArray(o.deliveryCategories)
        ? o.deliveryCategories.map((c: any) => ({
            id: String(c.id),
            categoryName: c.categoryName,
            description: c.description ?? null,
            options: (c.options || []).map((opt: any) => ({
              id: String(opt.id),
              optionName: opt.optionName,
              price: Number(opt.price) || 0,
              estimatedDays: opt.estimatedDays ?? null,
              description: opt.description ?? null,
              requiresAddress: opt.requiresAddress !== false,
              requiresLandmark: opt.requiresLandmark === true,
            })),
          }))
        : [],
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatMoney(
  money: Money,
  currencyOverride?: string,
): string {
  const currency = currencyOverride || money.currencyCode || "KES";
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Client-safe product search. Used by the header typeahead.
 * Routes through /api/search (Next.js) which attaches the storefront key.
 */
export async function searchProducts(
  orgSlug: string,
  query: string,
  limit = 6,
): Promise<Product[]> {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: { "x-org-slug": orgSlug },
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => null);
  if (!res.ok) return [];

  // Reshape from raw API shape. The API returns { products: ApiProduct[] }.
  // We can't call reshapeProduct here (it's in the same file) so we reuse it.
  const raw: ApiProduct[] = data?.products || [];
  return raw.map(reshapeProduct);
}

// ---------------------------------------------------------------------------
// Types re-exported for convenience
// ---------------------------------------------------------------------------

export type {
  Cart,
  CartItem,
  Collection,
  Image,
  Money,
  Product,
  ProductOption,
  ProductVariant,
} from "./types";