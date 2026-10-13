"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
};

export function MobileMenu({ open, onClose, links }: Props) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer from the right */}
      <div className="absolute right-0 top-0 h-full w-72 max-w-full bg-white shadow-xl flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          <span className="text-sm font-medium">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-lg px-4 py-3 text-base hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">
            Powered by Flexi
          </p>
        </div>
      </div>
    </div>
  );
}