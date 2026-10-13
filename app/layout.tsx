import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const SITE_NAME = process.env.SITE_NAME || "Flexi Storefront";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  robots: { follow: true, index: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
        <Toaster closeButton />
      </body>
    </html>
  );
}