const API_URL = process.env.API_URL;
const STOREFRONT_API_KEY = process.env.STOREFRONT_API_KEY;

console.log("[flexi/client] API_URL =", API_URL ? "set" : "MISSING");
console.log("[flexi/client] STOREFRONT_API_KEY =", STOREFRONT_API_KEY ? "set" : "MISSING");

export type FlexiError = Error & {
  status?: number;
  code?: string;
  detail?: unknown;
};

export type FlexiFetchParams = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  /** The org slug — always required, taken from route params */
  orgSlug: string;
  /** Next.js fetch options */
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
};

export async function flexiFetch<T>(
  path: string,
  opts: FlexiFetchParams,
): Promise<T> {
  if (!API_URL) throw new Error("API_URL is not set");
  if (!STOREFRONT_API_KEY) throw new Error("STOREFRONT_API_KEY is not set");
  if (!opts.orgSlug) {
    const err: FlexiError = new Error("orgSlug is required");
    err.status = 400;
    err.code = "NO_ORG_SLUG";
    throw err;
  }

  const url = new URL(`${API_URL}${path}`);
  if (opts.searchParams) {
    for (const [key, value] of Object.entries(opts.searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const hasNextOptions =
    opts.revalidate !== undefined || (opts.tags && opts.tags.length > 0);

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Storefront-Key": STOREFRONT_API_KEY,
      "X-Organization-Slug": opts.orgSlug,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    ...(hasNextOptions
      ? {
          next: {
            revalidate: opts.revalidate,
            tags: opts.tags,
          },
        }
      : { cache: opts.cache ?? "no-store" }),
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON body
  }

  if (!res.ok) {
    const err: FlexiError = new Error(
      payload?.error || `Request failed: ${res.status}`,
    );
    err.status = res.status;
    err.code = payload?.code;
    err.detail = payload;
    throw err;
  }

  return payload as T;
}
