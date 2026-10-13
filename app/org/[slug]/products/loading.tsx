import { ProductGridSkeleton } from "components/skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}