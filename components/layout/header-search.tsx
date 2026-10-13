"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { searchProducts } from "lib/flexi";
import type { Product } from "lib/flexi/types";

type Props = {
  variant?: "inline" | "overlay";
  onClose?: () => void;
  autoFocus?: boolean;
};

export function HeaderSearch({
  variant = "inline",
  onClose,
  autoFocus = false,
}: Props) {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Debounced search
  useEffect(() => {
    if (!slug) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const products = await searchProducts(slug, query.trim(), 6);
        setResults(products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, slug]);

  // Close on outside click (inline only)
  useEffect(() => {
    if (variant === "overlay") return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [variant]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    onClose?.();
  };

  const handleResultClick = () => {
    setOpen(false);
    onClose?.();
  };

  const showDropdown =
    open && query.trim().length >= 2 && (loading || results.length > 0 || query.trim().length >= 2);

  const containerClass =
    variant === "overlay"
      ? "flex flex-col w-full"
      : "relative w-full max-w-md";

  return (
    <div ref={wrapRef} className={containerClass}>
      <form onSubmit={submit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search products…"
            autoComplete="off"
            className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 pr-10 text-sm placeholder:text-neutral-400 focus:border-brand focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-neutral-500 hover:text-neutral-900"
            aria-label="Search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        </div>
      </form>

      {showDropdown && (
        <div
          className={`${
            variant === "overlay" ? "mt-2" : "absolute left-0 right-0 top-full z-50 mt-2"
          } max-h-96 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg`}
        >
          {loading && results.length === 0 ? (
            <div className="p-4 text-xs text-neutral-500">Searching…</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-xs text-neutral-500">
              No products match "{query}".
            </div>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.handle}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0 hover:bg-neutral-50"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                      {p.featuredImage?.url ? (
                        <Image
                          src={p.featuredImage.url}
                          alt={p.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] text-neutral-300">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">
                        {p.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {p.priceRange.minVariantPrice.amount}{" "}
                        {p.priceRange.minVariantPrice.currencyCode}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={submit}
                  className="w-full border-t border-neutral-100 p-3 text-left text-xs text-neutral-500 hover:bg-neutral-50"
                >
                  See all results for "{query}" →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}