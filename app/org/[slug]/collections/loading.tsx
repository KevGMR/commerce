import { ProductDetailSkeleton } from "components/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ProductDetailSkeleton />
    </div>
  );
}