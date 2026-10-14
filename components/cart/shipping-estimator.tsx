"use client";

import { useMemo } from "react";
import type { DeliveryCategory, ShippingInfo } from "lib/flexi/types";
import { formatMoney } from "lib/flexi";

type Props = {
  categories: DeliveryCategory[];
  value: ShippingInfo | null;
  onChange: (next: ShippingInfo | null) => void;
  currency: string;
};

export function ShippingEstimator({
  categories,
  value,
  onChange,
  currency,
}: Props) {
  // Selected category & option, derived from the value
  const selectedCategory = useMemo(
    () =>
      value
        ? categories.find((c) => c.categoryName === value.categoryName) || null
        : null,
    [categories, value],
  );

  const selectedOption = useMemo(
    () =>
      selectedCategory && value
        ? selectedCategory.options.find(
            (o) => o.optionName === value.optionName,
          ) || null
        : null,
    [selectedCategory, value],
  );

  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Delivery options are not configured for this store yet.
      </div>
    );
  }

  const handleCategoryChange = (categoryName: string) => {
    if (!categoryName) {
      onChange(null);
      return;
    }
    const category = categories.find((c) => c.categoryName === categoryName);
    if (!category || category.options.length === 0) {
      onChange(null);
      return;
    }
    const firstOption = category.options[0];
    if (!firstOption) {
      onChange(null);
      return;
    }
    onChange({
      categoryName: category.categoryName,
      optionName: firstOption.optionName,
      address: value?.address || { street: "", city: "" },
      notes: value?.notes,
    });
  };

  const handleOptionChange = (optionName: string) => {
    if (!value || !selectedCategory) return;
    onChange({ ...value, optionName });
  };

  const handleAddressChange = (
    field: keyof NonNullable<ShippingInfo["address"]>,
    v: string,
  ) => {
    if (!value) return;
    onChange({
      ...value,
      address: { ...value.address, [field]: v },
    });
  };

  const handleNotesChange = (notes: string) => {
    if (!value) return;
    onChange({ ...value, notes });
  };

  const requiresAddress = selectedOption?.requiresAddress ?? true;
  const requiresLandmark = selectedOption?.requiresLandmark ?? false;
  const estimatedDays = selectedOption?.estimatedDays;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Delivery</h3>

      {/* Category */}
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-700">
          Delivery method
        </label>
        <select
          value={value?.categoryName || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Select a method…</option>
          {categories.map((c) => {
            const firstPrice = c.options[0]?.price;
            return (
              <option key={c.id} value={c.categoryName}>
                {c.categoryName}
                {firstPrice !== undefined
                  ? ` — from ${formatMoney(
                      {
                        amount: firstPrice.toFixed(2),
                        currencyCode: currency,
                      },
                      currency,
                    )}`
                  : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* Option */}
      {selectedCategory && selectedCategory.options.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">
            Option
          </label>
          <select
            value={value?.optionName || ""}
            onChange={(e) => handleOptionChange(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            {selectedCategory.options.map((o) => (
              <option key={o.id} value={o.optionName}>
                {o.optionName} — {formatMoney(
                  { amount: o.price.toFixed(2), currencyCode: currency },
                  currency,
                )}
                {o.estimatedDays ? ` · ~${o.estimatedDays}d` : ""}
              </option>
            ))}
          </select>
          {estimatedDays && (
            <p className="mt-1 text-xs text-neutral-500">
              Estimated delivery: ~{estimatedDays}{" "}
              {estimatedDays === 1 ? "day" : "days"}
            </p>
          )}
        </div>
      )}

      {/* Address — only if the selected option requires it */}
      {value && requiresAddress && (
        <div className="space-y-3 border-t border-neutral-200 pt-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Street address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.address.street || ""}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              placeholder="e.g. 42 Ngong Road"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.address.city || ""}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              placeholder="e.g. Nairobi"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Landmark
              {requiresLandmark && <span className="text-red-500"> *</span>}
              {!requiresLandmark && (
                <span className="text-neutral-400"> (optional)</span>
              )}
            </label>
            <input
              type="text"
              value={value.address.landmark || ""}
              onChange={(e) => handleAddressChange("landmark", e.target.value)}
              placeholder="e.g. Near the blue gate"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {/* Optional extras, collapsed by default */}
          <details className="text-xs">
            <summary className="cursor-pointer text-neutral-500 hover:text-brand">
              Add more details
            </summary>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={value.address.state || ""}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                placeholder="State / Province (optional)"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <input
                type="text"
                value={value.address.postalCode || ""}
                onChange={(e) =>
                  handleAddressChange("postalCode", e.target.value)
                }
                placeholder="Postal code (optional)"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <input
                type="text"
                value={value.address.country || ""}
                onChange={(e) => handleAddressChange("country", e.target.value)}
                placeholder="Country"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </details>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Delivery notes (optional)
            </label>
            <textarea
              value={value.notes || ""}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={2}
              placeholder="Any special instructions for the driver"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Fee display */}
      {value && selectedOption && (
        <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
          <span className="text-neutral-500">Delivery fee</span>
          <span className="font-medium">
            {formatMoney(
              {
                amount: selectedOption.price.toFixed(2),
                currencyCode: currency,
              },
              currency,
            )}
          </span>
        </div>
      )}
    </div>
  );
}