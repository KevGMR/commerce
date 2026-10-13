"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "components/cart/cart-context";
import { formatMoney, checkout, getOrgClient } from "lib/flexi";
import type { Org } from "lib/flexi";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { cart, isHydrated, shippingInfo } = useCart();
  const [org, setOrg] = useState<Org | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!slug) return;
    getOrgClient(slug)
      .then((o) => setOrg(o))
      .catch(() => setOrg(null));
  }, [slug]);

  if (!isHydrated || !org) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-3 text-sm text-neutral-500">
          Add something to your cart to check out.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Shop products
        </Link>
      </div>
    );
  }

  if (!shippingInfo) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">
          Choose a delivery method
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          We need to know how you'd like to receive your order before we can
          check you out.
        </p>
        <Link
          href="/cart"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Back to cart
        </Link>
      </div>
    );
  }

  const subtotal = cart.cost.totalAmount;

  const selectedCategory = org.deliveryCategories.find(
    (c) => c.categoryName === shippingInfo.categoryName,
  );
  const selectedOption = selectedCategory?.options.find(
    (o) => o.optionName === shippingInfo.optionName,
  );
  const shippingFee = selectedOption?.price || 0;
  const total = Number(subtotal.amount) + Number(shippingFee || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const items = cart.lines.map((line) => ({
        variantId: line.merchandise.id,
        quantity: line.quantity,
      }));

      const res = await checkout(slug, {
        items,
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
        delivery: {
          categoryName: shippingInfo.categoryName,
          optionName: shippingInfo.optionName,
          address: {
            street: shippingInfo.address.street,
            city: shippingInfo.address.city,
            state: shippingInfo.address.state || undefined,
            postalCode: shippingInfo.address.postalCode || undefined,
            country: shippingInfo.address.country || "Kenya",
            landmark: shippingInfo.address.landmark || undefined,
          },
          notes: shippingInfo.notes || undefined,
        },
        notes: notes.trim() || undefined,
      });

      // Cart clears on payment confirmation, not here
      router.push(`/orders/${res.order.saleId}`);
    } catch (err: any) {
      setError(err?.message || "Checkout failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Link
          href="/cart"
          className="text-sm text-neutral-500 hover:text-brand"
        >
          ← Back to cart
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-base font-semibold">Contact</h2>
            <div className="mt-4 space-y-4">
              <Field label="Phone number" required>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="07XX XXX XXX"
                  className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  You'll receive an M-Pesa prompt on this number.
                </p>
              </Field>

              <Field label="Full name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Who is this order for?"
                  className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional — for order receipt"
                  className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none"
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold">Order notes</h2>
            <div className="mt-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional — gift notes, special requests"
                className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none"
              />
            </div>
          </section>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {submitting
              ? "Initiating M-Pesa payment…"
              : `Pay ${formatMoney(
                  {
                    amount: total.toFixed(2),
                    currencyCode: org.currency,
                  },
                  org.currency,
                )} with M-Pesa`}
          </button>

          <p className="text-center text-xs text-neutral-500">
            By placing this order you agree to our{" "}
            <Link href="/returns" className="underline hover:text-brand">
              returns policy
            </Link>
            .
          </p>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-24">
            <h2 className="text-base font-semibold">Order summary</h2>

            <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                    {line.merchandise.product.featuredImage?.url && (
                      <Image
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">
                      {line.merchandise.product.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Qty {line.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatMoney(line.cost.totalAmount, org.currency)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Delivery method recap */}
            <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
              <p className="text-xs font-medium text-neutral-500">
                Delivery method
              </p>
              <p className="mt-1 font-medium">
                {shippingInfo.categoryName} · {shippingInfo.optionName}
              </p>
              {shippingInfo.address.street && (
                <p className="mt-1 text-xs text-neutral-500">
                  {shippingInfo.address.street}
                  {shippingInfo.address.city && `, ${shippingInfo.address.city}`}
                  {shippingInfo.address.landmark &&
                    ` · ${shippingInfo.address.landmark}`}
                </p>
              )}
              <Link
                href="/cart"
                className="mt-2 inline-block text-xs text-brand hover:underline"
              >
                Change
              </Link>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd>{formatMoney(subtotal, org.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Delivery</dt>
                <dd>
                  {shippingFee > 0
                    ? formatMoney(
                        {
                          amount: shippingFee.toFixed(2),
                          currencyCode: org.currency,
                        },
                        org.currency,
                      )
                    : "Free"}
                </dd>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-900">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}