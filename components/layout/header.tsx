"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";
import { HeaderSearch } from "./header-search";

type Props = {
  orgName: string;
  slug: string;
  logoUrl: string | null;
  layout: "centered" | "left";
};

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/collections", label: "Collections" },
];

export function Header({ orgName, slug, logoUrl, layout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const Logo = (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={orgName}
          width={120}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
      ) : (
        <span className="text-lg font-semibold tracking-tight">
          {orgName}
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {layout === "centered" ? (
            <>
              {/* Left: nav (desktop) */}
              <nav className="hidden md:flex md:flex-1 items-center gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-neutral-700 hover:text-brand transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Center: logo */}
              <div className="flex flex-1 justify-start md:justify-center">
                {Logo}
              </div>

              {/* Right: search + cart + menu */}
              <div className="flex flex-1 items-center justify-end gap-2">
                <div className="hidden md:block">
                  <HeaderSearch />
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label="Search"
                >
                  <SearchIcon />
                </button>
                <CartButton />
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label="Open menu"
                >
                  <MenuIcon />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Left layout: logo on left */}
              {Logo}

              {/* Center: search (desktop) */}
              <div className="hidden md:flex flex-1 justify-center px-4">
                <HeaderSearch />
              </div>

              {/* Right: nav + actions */}
              <div className="flex items-center gap-2 md:gap-6">
                <nav className="hidden md:flex items-center gap-6">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-neutral-700 hover:text-brand transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label="Search"
                >
                  <SearchIcon />
                </button>
                <CartButton />
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label="Open menu"
                >
                  <MenuIcon />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
      />

      {searchOpen && (
        <MobileSearchOverlay onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}

function MobileSearchOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex items-center gap-2 border-b border-neutral-200 p-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="Close search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex-1">
          <HeaderSearch variant="overlay" autoFocus onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}