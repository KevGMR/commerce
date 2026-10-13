// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
};

// ---------------------------------------------------------------------------
// Product / Variant / Collection
// ---------------------------------------------------------------------------

export type ProductVariant = {
  id: string;
  sku: string;
  title: string;
  price: Money;
  compareAtPrice?: Money | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  tags: string[];
  options: ProductOption[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  featuredImage: Image | null;
  images: Image[];
  variants: ProductVariant[];
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image | null;
  path: string;
  productCount: number;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Cart — client-side, mirrors the shape the existing components expect
// ---------------------------------------------------------------------------

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image | null;
};

export type CartItem = {
  id: string; // synthesized line id
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string; // variant id
    title: string;
    selectedOptions: { name: string; value: string }[];
    product: CartProduct;
  };
};

export type Cart = {
  id: string | undefined;
  checkoutUrl: string; // unused for us, kept for shape parity
  totalQuantity: number;
  lines: CartItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
};

// ---------------------------------------------------------------------------
// Menu / Page — stubbed since we don't have these endpoints yet
// ---------------------------------------------------------------------------

export type Menu = {
  title: string;
  path: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

export type DeliveryOption = {
  id: string;
  optionName: string;
  price: number;
  estimatedDays: number | null;
  description: string | null;
  requiresAddress: boolean;
  requiresLandmark: boolean;
};

export type DeliveryCategory = {
  id: string;
  categoryName: string;
  description: string | null;
  options: DeliveryOption[];
};

// ---------------------------------------------------------------------------
// Shipping selection (client-side state, stored with the cart)
// ---------------------------------------------------------------------------

export type ShippingInfo = {
  categoryName: string;
  optionName: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
    landmark?: string;
  };
  notes?: string;
};