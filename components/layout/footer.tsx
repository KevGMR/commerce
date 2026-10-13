import Link from "next/link";

type Props = {
  orgName: string;
  tagline: string | null;
  slug: string;
  currency: string;
};

const SHOP_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/cart", label: "Cart" },
];

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer({ orgName, tagline, currency }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-base font-semibold">{orgName}</h3>
            {tagline && (
              <p className="mt-2 text-sm text-neutral-500 max-w-sm">
                {tagline}
              </p>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Shop
            </h4>
            <ul className="mt-4 space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-600 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Information
            </h4>
            <ul className="mt-4 space-y-2">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-600 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-500">
            © {year} {orgName}. All prices in {currency}.
          </p>
          <p className="text-xs text-neutral-400">Powered by Flexi</p>
        </div>
      </div>
    </footer>
  );
}