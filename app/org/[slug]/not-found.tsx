import Link from "next/link";

export default function OrgNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-medium text-neutral-500">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-neutral-500">
        We couldn't find what you were looking for. It may have been moved or
        removed.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-block rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/products"
          className="inline-block rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-50"
        >
          Shop products
        </Link>
      </div>
    </div>
  );
}