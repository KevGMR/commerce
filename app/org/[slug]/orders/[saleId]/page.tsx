"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderStatus, formatMoney } from "lib/flexi";
import type { OrderStatus } from "lib/flexi";
import { useCart } from "components/cart/cart-context";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

export default function OrderStatusPage() {
  const params = useParams<{ slug: string; saleId: string }>();
  const { slug, saleId } = params;
  const { clearCart } = useCart();

  const [status, setStatus] = useState<OrderStatus["order"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const clearedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await getOrderStatus(slug, saleId);
        if (cancelled) return;
        setStatus(res.order);

        if (res.order.paymentStatus === "completed") {
          if (!clearedRef.current) {
            clearedRef.current = true;
            clearCart();
          }
          return;
        }

        if (res.order.paymentStatus === "failed") {
          return;
        }

        if (pollCount >= MAX_POLLS) {
          setError(
            "Payment is taking longer than expected. Check back later — your cart is still saved.",
          );
          return;
        }

        setPollCount((n) => n + 1);
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Could not check order status.");
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, saleId]);

  if (!status && !error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-brand" />
        <p className="mt-4 text-neutral-500">Checking order…</p>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const isPending = status?.paymentStatus === "pending";
  const isComplete = status?.paymentStatus === "completed";
  const isFailed = status?.paymentStatus === "failed";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      {isPending && (
        <>
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-brand" />
          <h1 className="mt-6 text-2xl font-semibold">Waiting for M-Pesa…</h1>
          <p className="mt-3 text-neutral-500">
            Check your phone for the payment prompt. Enter your M-Pesa PIN to
            complete the order.
          </p>
          <p className="mt-6 text-sm text-neutral-400">
            Order #{status?.receiptNumber}
          </p>
          <p className="mt-8 text-xs text-neutral-400">
            Don't close this page — we're waiting for confirmation.
          </p>
        </>
      )}

      {isComplete && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-6 text-2xl font-semibold">Payment received</h1>
          <p className="mt-3 text-neutral-500">
            Thank you! Your order has been confirmed.
          </p>
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Order</span>
              <span className="font-mono">{status?.receiptNumber}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-neutral-500">Amount</span>
              <span className="font-medium">
                {formatMoney({
                  amount: String(status?.totalAmount ?? 0),
                  currencyCode: "KES",
                })}
              </span>
            </div>
            {status?.mpesaReceiptNumber && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-neutral-500">M-Pesa receipt</span>
                <span className="font-mono">
                  {status.mpesaReceiptNumber}
                </span>
              </div>
            )}
          </div>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-brand px-6 py-3 text-white hover:opacity-90"
          >
            Continue shopping
          </Link>
        </>
      )}

      {isFailed && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ✕
          </div>
          <h1 className="mt-6 text-2xl font-semibold">Payment failed</h1>
          <p className="mt-3 text-neutral-500">
            The M-Pesa payment was not completed. Your cart is still saved —
            you can try again.
          </p>
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Order reference</span>
              <span className="font-mono">{status?.receiptNumber}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-neutral-500">Amount</span>
              <span className="font-medium">
                {formatMoney({
                  amount: String(status?.totalAmount ?? 0),
                  currencyCode: "KES",
                })}
              </span>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="inline-block rounded-full bg-brand px-6 py-3 text-white hover:opacity-90"
            >
              Try payment again
            </Link>
            <Link
              href="/cart"
              className="inline-block rounded-full border border-neutral-300 px-6 py-3 hover:bg-neutral-50"
            >
              View cart
            </Link>
          </div>
          <p className="mt-6 text-xs text-neutral-400">
            Retrying is safe — no money has been deducted.
          </p>
        </>
      )}
    </div>
  );
}