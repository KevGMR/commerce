// storefront/components/add-to-cart-client.tsx
"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "lib/flexi/types";
import { useCart } from "components/cart/cart-context";
import { formatMoney } from "lib/flexi";

type Props = {
  product: Product;
  currency?: string;
};

/**
 * A product variant is keyed by a tuple of (optionName → value). For a
 * product with options [Color, Size], the shopper picks one value per
 * option, and we look up the matching variant.
 *
 * Availability logic:
 *   - A variant is "available" if `availableForSale === true`.
 *   - An option VALUE is "available" if there exists at least one variant
 *     that (a) contains that value for that option, (b) matches the
 *     currently-selected values of all *other* options, and (c) is
 *     `availableForSale`.
 *
 * That makes Black/2XL clickable when Red/XL is sold out but Black/2XL
 * isn't. And it greys out 2XL once Red is selected if there's no Red/2XL
 * in stock.
 */
export function AddToCartClient({ product, currency }: Props) {
  const { addCartItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Build a lookup: for each variant, a map of optionName → value.
  // Also group variants by their option tuple for O(1) lookups.
  const { optionGroups, variantByKey } = useMemo(() => {
    const groups: { name: string; values: string[] }[] = [];
    const seenGroup = new Map<string, Set<string>>();

    for (const v of product.variants) {
      for (const opt of v.selectedOptions) {
        if (!seenGroup.has(opt.name)) {
          seenGroup.set(opt.name, new Set());
          groups.push({ name: opt.name, values: [] });
        }
        const set = seenGroup.get(opt.name)!;
        if (!set.has(opt.value)) {
          set.add(opt.value);
          groups.find((g) => g.name === opt.name)!.values.push(opt.value);
        }
      }
    }

    // Preserve declaration order from product.options if available.
    if (Array.isArray(product.options) && product.options.length > 0) {
      const declaredOrder = product.options.map((o) => o.name);
      groups.sort(
        (a, b) =>
          declaredOrder.indexOf(a.name) - declaredOrder.indexOf(b.name),
      );
      // Also sort values by product.options order where possible.
      for (const group of groups) {
        const declOpt = product.options.find((o) => o.name === group.name);
        if (declOpt && Array.isArray(declOpt.values)) {
          group.values.sort(
            (a, b) => declOpt.values.indexOf(a) - declOpt.values.indexOf(b),
          );
        }
      }
    }

    // Key: sorted "name=value|name=value" pairs → variant.
    const keyed = new Map<string, ProductVariant>();
    for (const v of product.variants) {
      keyed.set(variantKey(v.selectedOptions), v);
    }

    return { optionGroups: groups, variantByKey: keyed };
  }, [product.variants, product.options]);

  // Selection state — one value per option.
  const initialSelection = useMemo(() => {
    // Default to the first in-stock variant if any; else first variant.
    const firstAvailable =
      product.variants.find((v) => v.availableForSale) || product.variants[0];
    const map: Record<string, string> = {};
    for (const opt of firstAvailable?.selectedOptions ?? []) {
      map[opt.name] = opt.value;
    }
    return map;
  }, [product.variants]);

  const [selection, setSelection] =
    useState<Record<string, string>>(initialSelection);

  // Currently-selected variant (from the tuple).
  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (optionGroups.length === 0) {
      return product.variants[0] ?? null;
    }
    // If any option is missing, no variant is complete.
    for (const g of optionGroups) {
      if (!selection[g.name]) return null;
    }
    const opts = optionGroups.map((g) => ({
      name: g.name,
      value: selection[g.name],
    }));
    return variantByKey.get(variantKey(opts)) ?? null;
  }, [selection, optionGroups, variantByKey, product.variants]);

  // Per-value availability: could this value be chosen without breaking
  // any other currently-selected option?
  const availabilityByGroup = useMemo(() => {
    const result: Record<string, Record<string, boolean>> = {};
    for (const group of optionGroups) {
      result[group.name] = {};
      for (const value of group.values) {
        // Build the candidate tuple with this option forced to `value`,
        // other options set to current selection.
        let found = false;
        for (const v of product.variants) {
          if (!v.availableForSale) continue;
          const matches = v.selectedOptions.every((opt) => {
            if (opt.name === group.name) return opt.value === value;
            const chosen = selection[opt.name];
            if (!chosen) return true; // unselected other options — allow
            return opt.value === chosen;
          });
          if (matches) {
            found = true;
            break;
          }
        }
        result[group.name][value] = found;
      }
    }
    return result;
  }, [optionGroups, product.variants, selection]);

  const handleOptionPick = (optionName: string, value: string) => {
    const nextSelection = { ...selection, [optionName]: value };

    // Auto-resolve: if picking this value makes another option's current
    // value unavailable, swap it to the first available value in that
    // group. If none available, clear that option entirely.
    for (const group of optionGroups) {
      if (group.name === optionName) continue;
      const currentValue = nextSelection[group.name];
      if (!currentValue) continue;

      // Check whether {group.name = currentValue, plus nextSelection}
      // is a valid in-stock combination.
      let stillAvailable = false;
      for (const v of product.variants) {
        if (!v.availableForSale) continue;
        const matches = v.selectedOptions.every((opt) => {
          const chosen = nextSelection[opt.name];
          if (!chosen) return true;
          return opt.value === chosen;
        });
        if (matches) {
          stillAvailable = true;
          break;
        }
      }

      if (!stillAvailable) {
        // Swap to first available value in that group.
        const swap = group.values.find((candidateValue) => {
          for (const v of product.variants) {
            if (!v.availableForSale) continue;
            const matches = v.selectedOptions.every((opt) => {
              if (opt.name === group.name) return opt.value === candidateValue;
              const chosen = nextSelection[opt.name];
              if (!chosen) return true;
              return opt.value === chosen;
            });
            if (matches) return true;
          }
          return false;
        });
        if (swap) {
          nextSelection[group.name] = swap;
        } else {
          delete nextSelection[group.name];
        }
      }
    }

    setSelection(nextSelection);
  };

  const handleAdd = () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    addCartItem(selectedVariant, product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // No variants — degenerate product.
  if (product.variants.length === 0) {
    return (
      <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
        This product is not available for purchase.
      </div>
    );
  }

  // Single-variant product — no option UI needed.
  if (optionGroups.length === 0) {
    const variant = product.variants[0];
    const available = variant.availableForSale;
    return (
      <div className="space-y-4">
        <PriceLine
          price={formatMoney(variant.price, currency)}
          available={available}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!available}
          className="relative w-full rounded-full bg-brand py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300"
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
    );
  }

  // Multi-variant product — render option groups.
  const isComplete = optionGroups.every((g) => Boolean(selection[g.name]));
  const canAdd = Boolean(
    selectedVariant && selectedVariant.availableForSale,
  );
  const isSoldOut = isComplete && !canAdd;

  const displayPrice =
    selectedVariant?.price ??
    product.variants.find((v) => v.availableForSale)?.price ??
    product.variants[0].price;

  return (
    <div className="space-y-5">
      <PriceLine
        price={formatMoney(displayPrice, currency)}
        available={Boolean(
          selectedVariant?.availableForSale ?? product.variants.some((v) => v.availableForSale),
        )}
      />

      {optionGroups.map((group) => (
        <div key={group.name} className="space-y-2">
          <p className="text-sm font-medium">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const isSelected = selection[group.name] === value;
              const isAvailable =
                availabilityByGroup[group.name]?.[value] ?? false;
              // Even an unavailable value can stay "selected" (visible
              // as struck through) if it's the current choice — but we
              // grey it out and prevent clicking.
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
        className="relative w-full rounded-full bg-brand py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {justAdded
          ? "✓ Added to cart"
          : !isComplete
            ? "Select options"
            : isSoldOut
              ? "Sold out"
              : `Add to cart · ${formatMoney(displayPrice, currency)}`}
      </button>

      {isComplete && selectedVariant && (
        <p className="text-center text-xs text-neutral-500">
          {selectedVariant.sku ? `SKU ${selectedVariant.sku} · ` : ""}
          Secure checkout with M-Pesa
        </p>
      )}
      {!isComplete && (
        <p className="text-center text-xs text-neutral-500">
          Please select all options above.
        </p>
      )}
    </div>
  );
}

function PriceLine({
  price,
  available,
}: {
  price: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-xl font-medium text-neutral-900">{price}</span>
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
  );
}

function variantKey(opts: { name: string; value: string }[]): string {
  return opts
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => `${o.name}=${o.value}`)
    .join("|");
}