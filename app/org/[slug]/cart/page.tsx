"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "components/cart/cart-context";
import { ShippingEstimator } from "components/cart/shipping-estimator";
import { formatMoney, getOrgClient } from "lib/flexi";
import type { Org } from "lib/flexi";

export default function CartPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { cart, isHydrated, updateCartItem, shippingInfo, setShippingInfo } =
    useCart();

  const [org, setOrg] = useState<Org | null>(null);

  useEffect(() => {
    if (!slug) return;
    getOrgClient(slug)
      .then((o) => setOrg(o))
      .catch(() => setOrg(null));
  }, [slug]);

  if (!isHydrated || !org) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-neutral-500">Loading cart…</p>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          Browse our products and add something you love.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  const subtotal = cart.cost.totalAmount;

  // Derive the shipping fee from the selected option
  const selectedCategory = shippingInfo
    ? org.deliveryCategories.find(
        (c) => c.categoryName === shippingInfo.categoryName,
      )
    : null;
  const selectedOption =
    selectedCategory && shippingInfo
      ? selectedCategory.options.find(
          (o) => o.optionName === shippingInfo.optionName,
        )
      : null;
  const shippingFee = selectedOption?.price || 0;

  const total =
    Number(subtotal.amount) + Number(shippingFee || 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Cart
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {cart.totalQuantity} item{cart.totalQuantity === 1 ? "" : "s"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        {/* Line items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-6">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {line.merchandise.product.featuredImage?.url ? (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-neutral-300">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.merchandise.product.handle}`}
                        className="line-clamp-2 text-sm font-medium hover:text-brand sm:text-base"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      {line.merchandise.title !== "Default" && (
                        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                          {line.merchandise.title}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium sm:text-base whitespace-nowrap">
                      {formatMoney(line.cost.totalAmount, org.currency)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItem(line.merchandise.id, "minus")
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-50"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItem(line.merchandise.id, "plus")
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItem(line.merchandise.id, "delete")
                      }
                      className="text-xs text-neutral-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              href="/products"
              className="text-sm text-neutral-500 hover:text-brand"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Summary with estimator */}
        <div className="lg:col-span-1">
          <div className="space-y-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-24">
            <ShippingEstimator
              categories={org.deliveryCategories}
              value={shippingInfo}
              onChange={setShippingInfo}
              currency={org.currency}
            />

            <dl className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="font-medium">
                  {formatMoney(subtotal, org.currency)}
                </dd>
              </div>
              {shippingFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Delivery</dt>
                  <dd className="font-medium">
                    {formatMoney(
                      {
                        amount: shippingFee.toFixed(2),
                        currencyCode: org.currency,
                      },
                      org.currency,
                    )}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>
                {formatMoney(
                  {
                    amount: total.toFixed(2),
                    currencyCode: org.currency,
                  },
                  org.currency,
                )}
              </span>
            </div>

            <Link
              href="/checkout"
              aria-disabled={!shippingInfo}
              onClick={(e) => {
                if (!shippingInfo) {
                  e.preventDefault();
                  alert("Please select a delivery method first.");
                }
              }}
              className={`block w-full rounded-full py-3.5 text-center text-sm font-medium transition-opacity ${
                shippingInfo
                  ? "bg-brand text-white hover:opacity-90"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              Proceed to checkout
            </Link>

            <p className="text-center text-xs text-neutral-500">
              Secure checkout with M-Pesa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}