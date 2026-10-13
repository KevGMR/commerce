"use client";

import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
  ShippingInfo
} from "lib/flexi/types";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "flexi-cart-v2";

type UpdateType = "plus" | "minus" | "delete";

type CartContextType = {
  cart: Cart;
  isHydrated: boolean;
  shippingInfo: ShippingInfo | null;
  setShippingInfo: (info: ShippingInfo | null) => void;
  addCartItem: (variant: ProductVariant, product: Product) => void;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Cart math
// ---------------------------------------------------------------------------

function calculateItemCost(quantity: number, unitPrice: string): string {
  return (Number(unitPrice) * quantity).toFixed(2);
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: "KES" },
      totalAmount: { amount: "0.00", currencyCode: "KES" },
      totalTaxAmount: { amount: "0.00", currencyCode: "KES" },
    },
  };
}

function updateCartTotals(lines: CartItem[]): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "KES";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: {
        amount: totalAmount.toFixed(2),
        currencyCode,
      },
      totalAmount: {
        amount: totalAmount.toFixed(2),
        currencyCode,
      },
      totalTaxAmount: {
        amount: "0.00",
        currencyCode,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
): CartItem {
  const quantity = existingItem ? existingItem.quantity + 1 : 1;
  const unitPrice = variant.price.amount;

  return {
    id: existingItem?.id ?? `line-${variant.id}`,
    quantity,
    cost: {
      totalAmount: {
        amount: calculateItemCost(quantity, unitPrice),
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

type StoredCart = {
  cart: Cart;
  shippingInfo: ShippingInfo | null;
};

function loadCartFromStorage(): StoredCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.cart || !Array.isArray(parsed.cart.lines)) {
      return null;
    }
    return {
      cart: parsed.cart as Cart,
      shippingInfo: (parsed.shippingInfo as ShippingInfo | null) || null,
    };
  } catch {
    return null;
  }
}

function saveCartToStorage(cart: Cart, shippingInfo: ShippingInfo | null) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredCart = { cart, shippingInfo };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full or disabled — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({
  children,
  // Kept for API compatibility with the fork's signature, but unused.
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise?: Promise<Cart | undefined>;
}) {
  
  const [cart, setCart] = useState<Cart>(createEmptyCart);
  const [shippingInfo, setShippingInfoState] = useState<ShippingInfo | null>(
    null,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadCartFromStorage();
    if (stored) {
      setCart(stored.cart);
      setShippingInfoState(stored.shippingInfo);
    }
    setIsHydrated(true);
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveCartToStorage(cart, shippingInfo);
  }, [cart, shippingInfo, isHydrated]);

  // Sync across browser tabs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = loadCartFromStorage();
      if (next) {
        setCart(next.cart);
        setShippingInfoState(next.shippingInfo);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addCartItem = useCallback(
    (variant: ProductVariant, product: Product) => {
      setCart((prev) => {
        const existing = prev.lines.find(
          (line) => line.merchandise.id === variant.id,
        );
        const updated = createOrUpdateCartItem(existing, variant, product);
        const lines = existing
          ? prev.lines.map((line) =>
              line.merchandise.id === variant.id ? updated : line,
            )
          : [...prev.lines, updated];

        return { ...prev, ...updateCartTotals(lines), lines };
      });
    },
    [],
  );

  const updateCartItem = useCallback(
    (merchandiseId: string, updateType: UpdateType) => {
      setCart((prev) => {
        if (updateType === "delete") {
          const lines = prev.lines.filter(
            (line) => line.merchandise.id !== merchandiseId,
          );
          if (lines.length === 0) return createEmptyCart();
          return { ...prev, ...updateCartTotals(lines), lines };
        }

        const lines = prev.lines
          .map((line) => {
            if (line.merchandise.id !== merchandiseId) return line;

            const newQuantity =
              updateType === "plus" ? line.quantity + 1 : line.quantity - 1;
            if (newQuantity <= 0) return null;

            const unitPrice =
              Number(line.cost.totalAmount.amount) / line.quantity;
            return {
              ...line,
              quantity: newQuantity,
              cost: {
                ...line.cost,
                totalAmount: {
                  ...line.cost.totalAmount,
                  amount: calculateItemCost(
                    newQuantity,
                    unitPrice.toString(),
                  ),
                },
              },
            };
          })
          .filter(Boolean) as CartItem[];

        if (lines.length === 0) return createEmptyCart();
        return { ...prev, ...updateCartTotals(lines), lines };
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart(createEmptyCart());
    setShippingInfoState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setShippingInfo = useCallback((info: ShippingInfo | null) => {
    setShippingInfoState(info);
  }, []);

  const value = useMemo(
    () => ({
      cart,
      isHydrated,
      shippingInfo,
      setShippingInfo,
      addCartItem,
      updateCartItem,
      clearCart,
    }),
    [
      cart,
      isHydrated,
      shippingInfo,
      setShippingInfo,
      addCartItem,
      updateCartItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}