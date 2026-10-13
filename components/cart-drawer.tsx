"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { useCart } from "components/cart/cart-context";
import { formatMoney, getOrgClient } from "lib/flexi";
import type { Org } from "lib/flexi";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { cart, isHydrated, updateCartItem, shippingInfo } = useCart();

  const [org, setOrg] = useState<Org | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load org (for delivery categories) once the drawer opens
  useEffect(() => {
    if (!open || !slug) return;
    if (org) return;
    getOrgClient(slug)
      .then((o) => setOrg(o))
      .catch(() => setOrg(null));
  }, [open, slug, org]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const lines = isHydrated ? cart.lines : [];
  const subtotal = cart.cost.totalAmount;

  // Derive delivery fee from selected shipping
  const selectedCategory =
    org && shippingInfo
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

  const subtotalNum = Number(subtotal.amount) || 0;
  const grandTotal = subtotalNum + shippingFee;

  const hasShipping = Boolean(shippingInfo && selectedOption);

  const content = (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
          <h2 className="text-base font-medium">
            Cart {lines.length > 0 && `(${cart.totalQuantity})`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-neutral-500">Your cart is empty.</p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 p-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {line.merchandise.product.featuredImage?.url ? (
                      <Image
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-300">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${line.merchandise.product.handle}`}
                        onClick={onClose}
                        className="line-clamp-2 text-sm font-medium hover:text-brand"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItem(line.merchandise.id, "delete")
                        }
                        className="text-xs text-neutral-500 hover:text-red-600 flex-shrink-0"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    {line.merchandise.title !== "Default" && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {line.merchandise.title}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(line.merchandise.id, "minus")
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-sm hover:bg-neutral-50"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(line.merchandise.id, "plus")
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-sm hover:bg-neutral-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatMoney(line.cost.totalAmount)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="shrink-0 border-t border-neutral-200 p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(subtotal)}
                </span>
              </div>

              {hasShipping ? (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 truncate pr-2">
                    Delivery · {selectedOption!.optionName}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {shippingFee === 0
                      ? "Free"
                      : formatMoney({
                          amount: shippingFee.toFixed(2),
                          currencyCode: subtotal.currencyCode,
                        })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Delivery</span>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="text-brand text-xs font-medium hover:underline"
                  >
                    Add delivery →
                  </Link>
                </div>
              )}
            </div>

            {hasShipping && (
              <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
                <span>Total</span>
                <span>
                  {formatMoney({
                    amount: grandTotal.toFixed(2),
                    currencyCode: subtotal.currencyCode,
                  })}
                </span>
              </div>
            )}

            {/* Primary action */}
            {hasShipping ? (
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full rounded-full bg-brand py-3 text-center text-sm font-medium text-white hover:opacity-90"
              >
                Checkout ·{" "}
                {formatMoney({
                  amount: grandTotal.toFixed(2),
                  currencyCode: subtotal.currencyCode,
                })}
              </Link>
            ) : (
              <>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand py-3 text-center text-sm font-medium text-white hover:opacity-90"
                >
                  Continue to delivery
                </Link>
                <p className="text-center text-xs text-neutral-500">
                  Choose a delivery method to see your total.
                </p>
              </>
            )}

            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full text-center text-xs text-neutral-500 hover:text-brand"
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}