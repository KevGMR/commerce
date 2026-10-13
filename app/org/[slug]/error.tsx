"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function OrgError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront] route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-neutral-500">
        We hit an unexpected error. Try again, or head back home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-block rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-block rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}