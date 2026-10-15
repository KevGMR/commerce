import type { ReactNode } from "react";

export function FullBleed({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative left-1/2 w-screen -translate-x-1/2 ${className}`}
    >
      {children}
    </div>
  );
}