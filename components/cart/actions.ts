"use server";

/**
 * Legacy server actions from the Vercel Commerce Shopify template.
 *
 * In the fork, these actions mutated a server-side Shopify cart. We've
 * replaced that with a purely client-side cart (localStorage) managed by
 * `components/cart/cart-context.tsx` via the `useCart()` hook.
 *
 * These functions are no-op stubs so existing imports don't break during
 * the migration. New code should call `useCart()` directly.
 */

export async function addItem(
  _prevState: any,
  _selectedVariantId: string | undefined,
): Promise<string | undefined> {
  return undefined;
}

export async function removeItem(
  _prevState: any,
  _merchandiseId: string,
): Promise<string | undefined> {
  return undefined;
}

export async function updateItemQuantity(
  _prevState: any,
  _payload: { merchandiseId: string; quantity: number },
): Promise<string | undefined> {
  return undefined;
}

export async function createCartAndSetCookie(): Promise<void> {
  return;
}

export async function redirectToCheckout(): Promise<void> {
  return;
}