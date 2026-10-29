"use client";

import { useMemo, useState } from "react";
import type {
  Product,
  ProductVariant,
  Image as FlexiImage,
} from "lib/flexi/types";
import { useCart } from "components/cart/cart-context";
import { formatMoney } from "lib/flexi";
import { ProductGallery } from "components/product-gallery";

type Props = {
  product: Product;
  images: FlexiImage[];
  currency?: string;
};

export function ProductDetailInteractive({
  product,
  images,
  currency,
}: Props) {
  const { addCartItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // ---- Build option groups + variant key index ---------------------------
  const { optionGroups, variantByKey } = useMemo(() => {
    // Prefer the product-level options[] declaration for building the
    // option groups — that's the canonical list and always includes every
    // colour and size even when some combinations aren't sold. Falls back
    // to variant.selectedOptions if options[] is missing.
    let groups: { name: string; values: string[] }[] = [];

    if (Array.isArray(product.options) && product.options.length > 0) {
      groups = product.options
        .filter((o) => o && o.name && Array.isArray(o.values))
        .map((o) => ({
          name: o.name,
          values: [...o.values],
        }));
    } else {
      const seen = new Map<string, Set<string>>();
      for (const v of product.variants) {
        for (const opt of v.selectedOptions) {
          if (!seen.has(opt.name)) {
            seen.set(opt.name, new Set());
            groups.push({ name: opt.name, values: [] });
          }
          const set = seen.get(opt.name);
          if (!set) continue;
          if (!set.has(opt.value)) {
            set.add(opt.value);
            const group = groups.find((g) => g.name === opt.name);
            if (group) group.values.push(opt.value);
          }
        }
      }
    }

    const keyed = new Map<string, ProductVariant>();
    for (const v of product.variants) {
      keyed.set(variantKey(v.selectedOptions), v);
    }

    return { optionGroups: groups, variantByKey: keyed };
  }, [product.variants, product.options]);

  // ---- Initial selection: first in-stock variant, else none --------------
  const productHasAnyStock = useMemo(
    () => product.variants.some((v) => v.availableForSale),
    [product.variants],
  );

  const initialSelection = useMemo(() => {
    if (!productHasAnyStock) return {};
    const pick = product.variants.find((v) => v.availableForSale);
    if (!pick) return {};
    const map: Record<string, string> = {};
    for (const opt of pick.selectedOptions) {
      map[opt.name] = opt.value;
    }
    return map;
  }, [product.variants, productHasAnyStock]);

  const [selection, setSelection] =
    useState<Record<string, string>>(initialSelection);

  // ---- Derive selected variant -------------------------------------------
  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (optionGroups.length === 0) return product.variants[0] ?? null;
    const tuple: { name: string; value: string }[] = [];
    for (const g of optionGroups) {
      const v = selection[g.name];
      if (!v) return null;
      tuple.push({ name: g.name, value: v });
    }
    return variantByKey.get(variantKey(tuple)) ?? null;
  }, [selection, optionGroups, variantByKey, product.variants]);

  // ---- Per-value availability matrix -------------------------------------
  const availabilityByGroup = useMemo(() => {
    const result: Record<string, Record<string, boolean>> = {};
    for (const group of optionGroups) {
      const groupMap: Record<string, boolean> = {};
      for (const value of group.values) {
        let found = false;
        for (const v of product.variants) {
          if (!v.availableForSale) continue;
          const matches = v.selectedOptions.every((opt) => {
            if (opt.name === group.name) return opt.value === value;
            const chosen = selection[opt.name];
            if (!chosen) return true;
            return opt.value === chosen;
          });
          if (matches) {
            found = true;
            break;
          }
        }
        groupMap[value] = found;
      }
      result[group.name] = groupMap;
    }
    return result;
  }, [optionGroups, product.variants, selection]);

  // ---- Gallery image sync from selected variant --------------------------
  // If the currently-selected variant carries its own image URL, swap the
  // gallery. If not, the gallery stays where the shopper left it.
  const variantImageUrl: string | null = useMemo(() => {
    const v = selectedVariant as
      | (ProductVariant & { image?: string | null })
      | null;
    return v?.image || null;
  }, [selectedVariant]);

  const variantImageIndex = useMemo(() => {
    if (!variantImageUrl) return -1;
    return images.findIndex((img) => img.url === variantImageUrl);
  }, [variantImageUrl, images]);

  // Use an effect-free approach: when the derived index changes to a valid
  // value, sync it into the gallery's active index. Doing this without an
  // effect avoids a re-render loop and satisfies react-hooks/exhaustive-deps.
  // (We call setActiveImageIndex only when it differs from the current
  // value — React bails out of the update otherwise.)
  if (variantImageIndex >= 0 && variantImageIndex !== activeImageIndex) {
    // This runs during render. setState during render is legal in React as
    // long as it's conditional and reflects derived state. React will
    // re-render immediately without committing the intermediate tree.
    setActiveImageIndex(variantImageIndex);
  }

  // ---- Option click with auto-repair of incompatible selections ----------
  const handleOptionPick = (optionName: string, value: string) => {
    const next: Record<string, string> = { ...selection, [optionName]: value };

    for (const group of optionGroups) {
      if (group.name === optionName) continue;
      const current = next[group.name];
      if (!current) continue;

      let stillValid = false;
      for (const v of product.variants) {
        if (!v.availableForSale) continue;
        const matches = v.selectedOptions.every((opt) => {
          const chosen = next[opt.name];
          if (!chosen) return true;
          return opt.value === chosen;
        });
        if (matches) {
          stillValid = true;
          break;
        }
      }

      if (!stillValid) {
        const swap = group.values.find((candidate) => {
          for (const v of product.variants) {
            if (!v.availableForSale) continue;
            const matches = v.selectedOptions.every((opt) => {
              if (opt.name === group.name) return opt.value === candidate;
              const chosen = next[opt.name];
              if (!chosen) return true;
              return opt.value === chosen;
            });
            if (matches) return true;
          }
          return false;
        });
        if (swap) next[group.name] = swap;
        else delete next[group.name];
      }
    }

    setSelection(next);
  };

  const handleAdd = () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    addCartItem(selectedVariant, product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // ---- Degenerate: no variants -------------------------------------------
  if (product.variants.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={images} title={product.title} />
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          This product is not available for purchase.
        </div>
      </div>
    );
  }

  // ---- Single-variant: no option UI --------------------------------------
  if (optionGroups.length === 0) {
    const variant = product.variants[0];
    if (!variant) return null;
    const available = variant.availableForSale;
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery
          images={images}
          title={product.title}
          activeIndex={activeImageIndex}
          onActiveIndexChange={setActiveImageIndex}
        />
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {product.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl font-medium text-neutral-900">
              {formatMoney(variant.price, currency)}
            </span>
            {available ? (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span className="text-green-700">In stock</span>
              </>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-600">Sold out</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!available}
            className="w-full rounded-full bg-brand py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {justAdded
              ? "✓ Added to cart"
              : available
                ? `Add to cart · ${formatMoney(variant.price, currency)}`
                : "Sold out"}
          </button>

          <p className="text-center text-xs text-neutral-500">
            Secure checkout with M-Pesa
          </p>
        </div>
      </div>
    );
  }

  // ---- Multi-variant: option groups + gallery ----------------------------
  const isComplete = optionGroups.every((g) => Boolean(selection[g.name]));
  const canAdd = Boolean(selectedVariant && selectedVariant.availableForSale);
  const productFullySoldOut = !productHasAnyStock;
  const isSoldOut = isComplete && !canAdd;

  const displayPrice =
    selectedVariant?.price ??
    product.variants.find((v) => v.availableForSale)?.price ??
    product.variants[0]?.price ?? {
        amount: "0.00",
        currencyCode: currency ?? "KES",
    };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      <ProductGallery
        images={images}
        title={product.title}
        activeIndex={activeImageIndex}
        onActiveIndexChange={setActiveImageIndex}
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {product.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-xl font-medium text-neutral-900">
            {formatMoney(displayPrice, currency)}
          </span>
          {canAdd ? (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="text-green-700">In stock</span>
            </>
          ) : (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span className="text-red-600">
                {productFullySoldOut || isComplete
                  ? "Sold out"
                  : "Select options"}
              </span>
            </>
          )}
        </div>

        {product.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>
        )}

        {/* Option groups */}
        {optionGroups.map((group) => (
          <div key={group.name} className="space-y-2">
            <p className="text-sm font-medium">{group.name}</p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = selection[group.name] === value;
                const isAvailable =
                  availabilityByGroup[group.name]?.[value] ?? false;
                return (
                  <button
                    key={`${group.name}-${value}`}
                    type="button"
                    onClick={() => handleOptionPick(group.name, value)}
                    disabled={!isAvailable && !isSelected}
                    className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : isAvailable
                          ? "border-neutral-300 text-neutral-900 hover:border-neutral-500"
                          : "border-neutral-200 text-neutral-400 cursor-not-allowed line-through"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full rounded-full bg-brand py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {justAdded
            ? "✓ Added to cart"
            : productFullySoldOut
              ? "Sold out"
              : !isComplete
                ? "Select options"
                : isSoldOut
                  ? "Sold out"
                  : `Add to cart · ${formatMoney(displayPrice, currency)}`}
        </button>

        <p className="text-center text-xs text-neutral-500">
          {selectedVariant?.sku
            ? `SKU ${selectedVariant.sku} · Secure checkout with M-Pesa`
            : "Secure checkout with M-Pesa"}
        </p>
      </div>
    </div>
  );
}

function variantKey(opts: { name: string; value: string }[]): string {
  return opts
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => `${o.name}=${o.value}`)
    .join("|");
}